import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft,
  Loader2, 
  GraduationCap, 
  Brain, 
  Code, 
  ShieldCheck 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

// Types
interface Category {
  id: string;
  name: string;
  description: string;
}

interface Difficulty {
  id: string;
  name: string;
  description: string;
}

interface ExerciseType {
  id: string;
  name: string;
  description: string;
}

interface Question {
  id: string;
  type: 'qcm' | 'text' | 'code';
  question: string;
  options?: string[];
  code?: string;
  correctAnswer?: string | string[];
  explanation?: string;
}

interface QuizResponse {
  questionId: string;
  response: string | string[];
}

interface EvaluationResult {
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  detailedResults: {
    questionId: string;
    correct: boolean;
    feedback: string;
  }[];
}

// Main component
export default function CyberTestTechnique() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('');
  const [step, setStep] = useState<'select' | 'quiz' | 'results' | 'custom'>('select');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult | null>(null);
  const [userName, setUserName] = useState<string>('Arnaud Gauthier');
  const [generateProgress, setGenerateProgress] = useState(0);
  const [customTestPrompt, setCustomTestPrompt] = useState('');
  const [customTestTechnical, setCustomTestTechnical] = useState(true);
  const [customTestLevel, setCustomTestLevel] = useState('medium');
  const [useStoredQuestions, setUseStoredQuestions] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('standardTest');

  const { toast } = useToast();

  // Mock options
  const mockOptions = {
    categories: [
      { id: 'web', name: 'Sécurité Web', description: 'Sécurité des applications web' },
      { id: 'network', name: 'Sécurité Réseau', description: 'Protection des infrastructures réseau' },
      { id: 'system', name: 'Sécurité Système', description: 'Sécurisation des systèmes d\'exploitation' }
    ],
    difficulties: [
      { id: 'easy', name: 'Débutant', description: 'Concepts fondamentaux' },
      { id: 'medium', name: 'Intermédiaire', description: 'Connaissances approfondies' },
      { id: 'hard', name: 'Avancé', description: 'Expertise technique' }
    ],
    exerciseTypes: [
      { id: 'qcm', name: 'QCM', description: 'Questions à choix multiples' },
      { id: 'text', name: 'Texte', description: 'Réponses rédigées' },
      { id: 'code', name: 'Code', description: 'Analyse et correction de code' }
    ]
  };

  // Simulated options loading
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [options, setOptions] = useState(mockOptions);

  // Simulated generate questions mutation
  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update progress during generation
      const progressInterval = setInterval(() => {
        setGenerateProgress(prev => {
          const newValue = prev + 10;
          if (newValue >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newValue;
        });
      }, 300);
      
      // Mock questions
      const mockQuestions = [
        {
          id: 'q1',
          type: 'qcm' as const,
          question: 'Quelle est la principale faiblesse exploitée par les attaques XSS?',
          options: [
            'Absence de validation des entrées utilisateur',
            'Mauvaise configuration des pare-feu',
            'Mots de passe faibles',
            'Permissions système trop élevées'
          ],
          correctAnswer: ['Absence de validation des entrées utilisateur'],
          explanation: 'Les attaques XSS exploitent l\'absence de validation ou d\'échappement des entrées utilisateur, permettant l\'injection de code malveillant.'
        },
        {
          id: 'q2',
          type: 'text' as const,
          question: 'Expliquez comment fonctionne une attaque CSRF et comment s\'en protéger.',
          correctAnswer: 'Une attaque CSRF force un utilisateur authentifié à exécuter des actions non désirées. Pour s\'en protéger, on utilise des tokens anti-CSRF, on vérifie l\'en-tête Referer, et on implémente SameSite pour les cookies.',
          explanation: 'Les protections principales contre le CSRF incluent l\'utilisation de tokens uniques dans les formulaires et les requêtes AJAX, ainsi que la vérification de l\'origine de la requête.'
        }
      ];
      
      return { questions: mockQuestions };
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setResponses(data.questions.map(q => ({ questionId: q.id, response: q.type === 'qcm' ? [] : '' })));
      setStep('quiz');
      setGenerateProgress(0);
      toast({
        title: 'Test généré',
        description: 'Votre test technique a été généré avec succès.',
      });
    },
    onError: () => {
      setGenerateProgress(0);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du test.',
        variant: 'destructive',
      });
    }
  });

  // Simulated create custom test mutation
  const createCustomTestMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Update progress during generation
      const progressInterval = setInterval(() => {
        setGenerateProgress(prev => {
          const newValue = prev + 5;
          if (newValue >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newValue;
        });
      }, 200);
      
      // Mock questions
      const mockQuestions = [
        {
          id: 'custom1',
          type: 'qcm' as const,
          question: 'Dans le cadre de ' + data.prompt + ', quelle serait la meilleure approche?',
          options: [
            'Implémenter une authentification multifacteur',
            'Renforcer la surveillance du réseau',
            'Former les utilisateurs aux risques',
            'Mettre à jour régulièrement les systèmes'
          ],
          correctAnswer: ['Former les utilisateurs aux risques'],
          explanation: 'La formation des utilisateurs est essentielle pour réduire les risques liés à la sécurité.'
        },
        {
          id: 'custom2',
          type: 'text' as const,
          question: 'Élaborez une stratégie de réponse à incident adaptée à ' + data.prompt,
          correctAnswer: 'Une stratégie de réponse efficace comprend la détection, l\'endiguement, l\'éradication, et la récupération, avec une documentation complète et une analyse post-incident.',
          explanation: 'Une réponse à incident bien structurée minimise les dommages et accélère le retour à la normale.'
        }
      ];
      
      return { questions: mockQuestions };
    },
    onSuccess: (data) => {
      setQuestions(data.questions);
      setResponses(data.questions.map(q => ({ questionId: q.id, response: q.type === 'qcm' ? [] : '' })));
      setStep('quiz');
      setGenerateProgress(0);
      toast({
        title: 'Test personnalisé généré',
        description: 'Votre test technique personnalisé a été généré avec succès.',
      });
    },
    onError: () => {
      setGenerateProgress(0);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la génération du test personnalisé.',
        variant: 'destructive',
      });
    }
  });

  // Function to handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'standardTest') {
      setStep('select');
    } else if (value === 'customTest') {
      setStep('custom');
    }
  };

  // Function to render the user name field with "Bientôt disponible" label
  const renderNameField = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Votre nom
        </label>
        <div className="relative">
          <input 
            type="text" 
            className="flex h-10 w-full rounded-md border border-blue-700 bg-blue-900/50 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed opacity-50"
            value="Arnaud Gauthier"
            readOnly
            disabled
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-3 bg-amber-600 text-white px-2 py-0.5 rounded-sm text-xs">
            Bientôt disponible
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Ce champ sera personnalisable prochainement</p>
      </div>
    );
  };

  // Selection view
  const renderSelectionView = () => (
    <div className="space-y-6">
      {renderNameField()}
      
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Catégorie de test
        </label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez une catégorie" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            {options.categories.map(category => (
              <SelectItem key={category.id} value={category.id} className="text-white hover:bg-blue-800">
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1">
          {selectedCategory && options.categories.find(c => c.id === selectedCategory)?.description}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Niveau de difficulté
        </label>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez un niveau de difficulté" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            {options.difficulties.map(difficulty => (
              <SelectItem key={difficulty.id} value={difficulty.id} className="text-white hover:bg-blue-800">
                {difficulty.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1">
          {selectedDifficulty && options.difficulties.find(d => d.id === selectedDifficulty)?.description}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Type d'exercice
        </label>
        <Select value={selectedExerciseType} onValueChange={setSelectedExerciseType}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez un type d'exercice" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            {options.exerciseTypes.map(type => (
              <SelectItem key={type.id} value={type.id} className="text-white hover:bg-blue-800">
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400 mt-1">
          {selectedExerciseType && options.exerciseTypes.find(t => t.id === selectedExerciseType)?.description}
        </p>
      </div>

      <div className="pt-4">
        <Button 
          onClick={() => generateQuestionsMutation.mutate({ 
            category: selectedCategory, 
            difficulty: selectedDifficulty, 
            exerciseType: selectedExerciseType,
            useStored: useStoredQuestions
          })}
          disabled={isLoadingOptions || !selectedCategory || !selectedDifficulty || !selectedExerciseType || generateQuestionsMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {generateQuestionsMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              Commencer le test
            </>
          )}
        </Button>
        
        {generateQuestionsMutation.isPending && (
          <div className="mt-2 w-full">
            <Progress 
              value={generateProgress} 
              className="h-1.5 bg-blue-950 w-full"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{generateProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );

  // Custom test view
  const renderCustomTestView = () => (
    <div className="space-y-6">
      {renderNameField()}

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Décrivez le test personnalisé que vous souhaitez générer
        </label>
        <Textarea 
          value={customTestPrompt}
          onChange={(e) => setCustomTestPrompt(e.target.value)}
          placeholder="Ex: Créer un test sur la sécurité des API REST avec un focus sur l'authentification OAuth2"
          className="min-h-[120px] bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
        />
        <p className="text-xs text-blue-300 mt-1">
          Décrivez le sujet, le contexte et les compétences à évaluer
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Niveau technique
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer text-white">
            <input
              type="radio"
              checked={customTestTechnical}
              onChange={() => setCustomTestTechnical(true)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span>Technique</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-white">
            <input
              type="radio"
              checked={!customTestTechnical}
              onChange={() => setCustomTestTechnical(false)}
              className="form-radio h-4 w-4 text-blue-600"
            />
            <span>Non technique</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Niveau de difficulté
        </label>
        <Select value={customTestLevel} onValueChange={setCustomTestLevel}>
          <SelectTrigger className="w-full bg-blue-900/50 border-blue-700 text-white">
            <SelectValue placeholder="Sélectionnez un niveau de difficulté" />
          </SelectTrigger>
          <SelectContent className="bg-blue-950 border-blue-800 text-white">
            <SelectItem value="easy" className="text-white hover:bg-blue-800">Débutant</SelectItem>
            <SelectItem value="medium" className="text-white hover:bg-blue-800">Intermédiaire</SelectItem>
            <SelectItem value="hard" className="text-white hover:bg-blue-800">Avancé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4">
        <Button 
          onClick={() => createCustomTestMutation.mutate({ 
            prompt: customTestPrompt,
            technical: customTestTechnical,
            level: customTestLevel
          })}
          disabled={!customTestPrompt || createCustomTestMutation.isPending}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
        >
          {createCustomTestMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              Créer un test personnalisé
            </>
          )}
        </Button>
        
        {createCustomTestMutation.isPending && (
          <div className="mt-2 w-full">
            <Progress 
              value={generateProgress} 
              className="h-1.5 bg-blue-950 w-full"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
            />
            <p className="text-xs text-blue-300 mt-1 text-right">{generateProgress}%</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-950 to-slate-950">
      {/* Background grid pattern like other cyber pages */}
      <div className="absolute inset-0 z-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 container max-w-4xl mx-auto py-6 px-4">
        {/* Bouton retour */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30 hover:text-white mb-4"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Test Technique de Cybersécurité</h1>
          <p className="text-blue-200 mt-2">
            Évaluez vos compétences techniques en cybersécurité à travers une série d'exercices pratiques.
          </p>
        </div>

        <Card className="bg-gradient-to-b from-blue-950 to-slate-950 border-blue-800 text-white shadow-xl border">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Créer un nouveau test</CardTitle>
          <CardDescription className="text-blue-200">
            Configurez votre test technique selon vos besoins ou générez un test personnalisé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standardTest" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-2 mb-6 bg-blue-900/30 border border-blue-700">
              <TabsTrigger 
                value="standardTest" 
                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-blue-200"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Test Standard
              </TabsTrigger>
              <TabsTrigger 
                value="customTest" 
                className="data-[state=active]:bg-blue-700 data-[state=active]:text-white text-blue-200"
              >
                <Brain className="w-4 h-4 mr-2" />
                Test Personnalisé
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="standardTest">
              {renderSelectionView()}
            </TabsContent>
            
            <TabsContent value="customTest">
              {renderCustomTestView()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}