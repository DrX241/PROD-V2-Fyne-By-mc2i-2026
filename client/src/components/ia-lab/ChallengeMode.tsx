import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Code,
  PlayCircle,
  BookOpen,
  Lightbulb,
  Trophy,
  Award,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
  HelpCircle,
  Send,
  Filter,
  Copy,
} from 'lucide-react';
import Editor from '@monaco-editor/react';

// Types 
interface Challenge {
  id: string;
  title: string;
  description: string;
  language: 'python' | 'sql';
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  initialCode: string;
  expectedOutput?: string;
  validationCriteria?: string[];
  hints: string[];
  solution?: string;
  category: string;
  sector?: string; // Secteur d'activité ajouté
}

interface Evaluation {
  isCorrect: boolean;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string;
}

// Composant principal de mode défi
const ChallengeMode: React.FC<{
  language: 'python' | 'sql';
  editorValue: string;
  setEditorValue: (value: string) => void;
  executeCode: () => void;
  executionResult: string;
  isProcessing: boolean;
}> = ({ language, editorValue, setEditorValue, executeCode, executionResult, isProcessing }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('débutant');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [usedHints, setUsedHints] = useState<string[]>([]);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isGettingHint, setIsGettingHint] = useState<boolean>(false);
  const [additionalHint, setAdditionalHint] = useState<string>('');
  const [showSolution, setShowSolution] = useState<boolean>(false);
  
  // Récupérer les catégories disponibles pour le langage sélectionné et les secteurs d'activité
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`/api/ia-lab/challenge/categories/${language}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.categories) {
            setCategories(data.categories);
            // Sélectionner la première catégorie par défaut
            if (data.categories.length > 0 && !selectedCategory) {
              setSelectedCategory(data.categories[0]);
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les catégories de défis.",
          variant: "destructive",
        });
      }
    };

    const fetchSectors = async () => {
      try {
        const response = await fetch('/api/ia-lab/challenge/sectors');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.sectors) {
            setSectors(data.sectors);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des secteurs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les secteurs d'activité.",
          variant: "destructive",
        });
      }
    };

    fetchCategories();
    fetchSectors();
  }, [language]);

  // Générer un défi
  const generateChallenge = async () => {
    if (!selectedCategory || !selectedDifficulty) {
      toast({
        title: "Paramètres manquants",
        description: "Veuillez sélectionner une catégorie et une difficulté.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingChallenge(true);
    setCurrentChallenge(null);
    setEvaluation(null);
    setUsedHints([]);
    setAdditionalHint('');
    setShowSolution(false);

    try {
      // Préparation des données à envoyer
      const requestData: any = {
        language,
        category: selectedCategory,
        difficulty: selectedDifficulty,
      };
      
      // Ajouter le secteur d'activité s'il est sélectionné et différent de "tous"
      if (selectedSector && selectedSector !== 'tous') {
        requestData.sector = selectedSector;
      }
      
      const response = await fetch('/api/ia-lab/challenge/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.challenge) {
          setCurrentChallenge(data.challenge);
          setEditorValue(data.challenge.initialCode);
          
          toast({
            title: "Défi généré",
            description: "Un nouveau défi a été généré. Bonne chance !",
            variant: "default",
          });
        } else {
          throw new Error("Format de réponse incorrect");
        }
      } else {
        throw new Error("Erreur lors de la génération du défi");
      }
    } catch (error) {
      console.error('Erreur lors de la génération du défi:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer un défi. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  // Évaluer la solution
  const evaluateSolution = async () => {
    if (!currentChallenge || !executionResult) {
      toast({
        title: "Impossible d'évaluer",
        description: "Exécutez votre code d'abord pour obtenir un résultat.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const response = await fetch('/api/ia-lab/challenge/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          userCode: editorValue,
          executionResult,
          language,
          challenge: currentChallenge,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.evaluation) {
          setEvaluation(data.evaluation);
          
          // Afficher un toast différent selon que la solution est correcte ou non
          if (data.evaluation.isCorrect) {
            toast({
              title: "Félicitations !",
              description: "Votre solution est correcte !",
              variant: "default",
            });
          } else {
            toast({
              title: "Presque !",
              description: "Votre solution nécessite quelques ajustements.",
              variant: "default",
            });
          }
        } else {
          throw new Error("Format de réponse incorrect");
        }
      } else {
        throw new Error("Erreur lors de l'évaluation de la solution");
      }
    } catch (error) {
      console.error('Erreur lors de l\'évaluation de la solution:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'évaluer votre solution. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Obtenir un indice supplémentaire
  const getAdditionalHint = async () => {
    if (!currentChallenge) {
      return;
    }

    setIsGettingHint(true);

    try {
      const response = await fetch('/api/ia-lab/challenge/hint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          userCode: editorValue,
          language,
          challenge: currentChallenge,
          usedHints,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.hint) {
          setAdditionalHint(data.hint);
          // Ajouter cet indice à la liste des indices utilisés
          setUsedHints(prev => [...prev, data.hint]);
          
          toast({
            title: "Indice disponible",
            description: "Un nouvel indice a été généré pour vous aider.",
            variant: "default",
          });
        } else {
          throw new Error("Format de réponse incorrect");
        }
      } else {
        throw new Error("Erreur lors de la récupération de l'indice");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'indice:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir un indice. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGettingHint(false);
    }
  };

  // Réinitialiser le code à l'état initial
  const resetCodeToInitial = () => {
    if (currentChallenge) {
      setEditorValue(currentChallenge.initialCode);
      toast({
        title: "Code réinitialisé",
        description: "Le code a été réinitialisé à son état initial.",
        variant: "default",
      });
    }
  };

  // Afficher ou masquer la solution
  const toggleSolution = () => {
    if (!showSolution && currentChallenge?.solution) {
      toast({
        title: "Solution affichée",
        description: "N'oubliez pas qu'apprendre par soi-même est plus bénéfique !",
        variant: "default",
      });
    }
    setShowSolution(!showSolution);
  };

  // Rendre le composant
  return (
    <div className="mt-4 space-y-6">
      {/* Section de génération de défi */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-blue-500/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-amber-400" />
                Mode Défi IA
              </CardTitle>
              <CardDescription className="text-gray-400 mt-1">
                Résolvez des problèmes générés par l'IA et perfectionnez vos compétences en {language === 'python' ? 'Python' : 'SQL'}
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-900/50 border-blue-700/30">
                {language === 'python' ? 'Python' : 'SQL'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto max-w-7xl">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Catégorie
              </label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
                disabled={isGeneratingChallenge}
              >
                <SelectTrigger className="w-full bg-slate-800/80 border-blue-500/30 text-white">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-500/30 text-white">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Secteur d'activité
              </label>
              <Select 
                value={selectedSector} 
                onValueChange={setSelectedSector}
                disabled={isGeneratingChallenge}
              >
                <SelectTrigger className="w-full bg-slate-800/80 border-blue-500/30 text-white">
                  <SelectValue placeholder="Tous les secteurs" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-500/30 text-white max-h-60 overflow-y-auto">
                  <SelectItem value="tous">Tous les secteurs</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1 block">
                Difficulté
              </label>
              <Select 
                value={selectedDifficulty} 
                onValueChange={setSelectedDifficulty}
                disabled={isGeneratingChallenge}
              >
                <SelectTrigger className="w-full bg-slate-800/80 border-blue-500/30 text-white">
                  <SelectValue placeholder="Sélectionner une difficulté" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-blue-500/30 text-white">
                  <SelectItem value="débutant">Débutant</SelectItem>
                  <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="avancé">Avancé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium"
                disabled={isGeneratingChallenge || !selectedCategory || !selectedDifficulty}
                onClick={generateChallenge}
              >
                {isGeneratingChallenge ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="truncate">Génération en cours...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    <span className="truncate">Générer un défi</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affichage du défi en cours */}
      {currentChallenge && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-blue-500/20">
          <CardHeader className="pb-3 border-b border-blue-500/20">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white text-xl">
                  {currentChallenge.title}
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-blue-900/50 border-blue-700/30">
                    {currentChallenge.category}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${currentChallenge.difficulty === 'débutant' ? 'bg-green-900/50 border-green-700/30 text-green-300' : ''}
                      ${currentChallenge.difficulty === 'intermédiaire' ? 'bg-amber-900/50 border-amber-700/30 text-amber-300' : ''}
                      ${currentChallenge.difficulty === 'avancé' ? 'bg-red-900/50 border-red-700/30 text-red-300' : ''}
                    `}
                  >
                    {currentChallenge.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  onClick={resetCodeToInitial}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Réinitialiser
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-amber-500/30 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                  onClick={toggleSolution}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  {showSolution ? 'Masquer solution' : 'Voir solution'}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4 px-4 sm:px-6">
            <div className="space-y-4 mx-auto max-w-7xl">
              <div>
                <h3 className="text-white font-medium mb-2">Description</h3>
                <div className="bg-black/30 rounded-md p-3 text-gray-300 text-sm whitespace-pre-wrap overflow-x-auto">
                  {currentChallenge.description}
                </div>
              </div>
              
              {currentChallenge.expectedOutput && (
                <div>
                  <h3 className="text-white font-medium mb-2">Sortie attendue</h3>
                  <div className="bg-black/30 rounded-md p-3 text-gray-300 text-sm font-mono overflow-x-auto">
                    {currentChallenge.expectedOutput}
                  </div>
                </div>
              )}
              
              {/* Section des indices */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">Indices</h3>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-900/20"
                    onClick={getAdditionalHint}
                    disabled={isGettingHint}
                  >
                    {isGettingHint ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <HelpCircle className="mr-1 h-3 w-3" />
                    )}
                    Demander un indice
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {currentChallenge.hints.map((hint, index) => (
                    <div 
                      key={index} 
                      className="bg-amber-900/20 border border-amber-500/20 rounded-md p-2 text-gray-300 text-sm"
                    >
                      <div className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{hint}</span>
                      </div>
                    </div>
                  ))}
                  
                  {additionalHint && (
                    <div className="bg-amber-900/20 border border-amber-500/20 rounded-md p-2 text-gray-300 text-sm">
                      <div className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{additionalHint}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Solution (conditionnellement visible) */}
              {showSolution && currentChallenge.solution && (
                <div>
                  <h3 className="text-white font-medium mb-2">Solution</h3>
                  <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-emerald-900/50 border-emerald-700/30 text-emerald-300">
                        Solution de référence
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"
                        onClick={() => {
                          navigator.clipboard.writeText(currentChallenge.solution!);
                          toast({
                            title: "Solution copiée",
                            description: "La solution a été copiée dans le presse-papier.",
                            variant: "default",
                          });
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Copier
                      </Button>
                    </div>
                    
                    <pre className="text-gray-300 text-sm font-mono overflow-x-auto whitespace-pre-wrap p-2 bg-black/30 rounded">
                      {currentChallenge.solution}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Actions principales */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  onClick={executeCode}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exécution...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Exécuter le code
                    </>
                  )}
                </Button>
                
                <Button
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  onClick={evaluateSolution}
                  disabled={isEvaluating || !executionResult}
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Évaluation...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Évaluer ma solution
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Affichage de l'évaluation de la solution */}
      {evaluation && (
        <Card className={`
          border 
          ${evaluation.isCorrect 
            ? 'bg-gradient-to-br from-emerald-900/50 to-slate-900/90 border-emerald-500/30' 
            : 'bg-gradient-to-br from-amber-900/50 to-slate-900/90 border-amber-500/30'}
        `}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center">
                {evaluation.isCorrect ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5 text-emerald-400" />
                    Solution validée !
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-5 w-5 text-amber-400" />
                    Solution à améliorer
                  </>
                )}
              </CardTitle>
              
              <Badge 
                variant="outline" 
                className={`
                  ${evaluation.isCorrect ? 'bg-emerald-900/50 border-emerald-700/30 text-emerald-300' : 'bg-amber-900/50 border-amber-700/30 text-amber-300'}
                `}
              >
                Score: {evaluation.score}/100
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2 space-y-4 px-4 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <h3 className="text-white font-medium mb-2">Feedback</h3>
              <div className="bg-black/30 rounded-md p-3 text-gray-300 text-sm break-words">
                {evaluation.feedback}
              </div>
            </div>
            
            {/* Points forts */}
            {evaluation.strengths.length > 0 && (
              <div className="mx-auto max-w-7xl">
                <h3 className="text-white font-medium mb-2">Points forts</h3>
                <div className="space-y-2">
                  {evaluation.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start bg-blue-900/20 border border-blue-500/20 rounded-md p-2 text-gray-300 text-sm">
                      <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Améliorations suggérées */}
            {evaluation.improvements.length > 0 && (
              <div className="mx-auto max-w-7xl">
                <h3 className="text-white font-medium mb-2">Pistes d'amélioration</h3>
                <div className="space-y-2">
                  {evaluation.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start bg-amber-900/20 border border-amber-500/20 rounded-md p-2 text-gray-300 text-sm">
                      <Lightbulb className="h-4 w-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Prochaines étapes */}
            <div className="mx-auto max-w-7xl">
              <h3 className="text-white font-medium mb-2">Pour aller plus loin</h3>
              <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-md p-3 text-gray-300 text-sm break-words">
                {evaluation.nextSteps}
              </div>
            </div>
            
            {/* Actions après évaluation */}
            <div className="flex flex-wrap gap-3 pt-2">
              {evaluation.isCorrect ? (
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  onClick={generateChallenge}
                >
                  <Award className="mr-2 h-4 w-4" />
                  Nouveau défi
                </Button>
              ) : (
                <Button
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                  onClick={() => {
                    setEvaluation(null);
                    toast({
                      title: "Continuez !",
                      description: "Vous pouvez améliorer votre solution et réessayer.",
                      variant: "default",
                    });
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Continuer à coder
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Composant pour afficher l'icône de l'oeil
// (non fournie par lucide-react, donc on la crée)
const Eye = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default ChallengeMode;