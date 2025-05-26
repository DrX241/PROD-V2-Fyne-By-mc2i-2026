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
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

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
  const [step, setStep] = useState<'select' | 'quiz' | 'results'>('select');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResult | null>(null);
  const [userName, setUserName] = useState<string>('Julien Grimault');
  const [generateProgress, setGenerateProgress] = useState(0);
  const [customTestPrompt, setCustomTestPrompt] = useState('');
  const [customTestTechnical, setCustomTestTechnical] = useState(true);
  const [customTestLevel, setCustomTestLevel] = useState('medium');
  const [useStoredQuestions, setUseStoredQuestions] = useState(true);

  // Banque de questions pré-stockées pour éviter les appels API
  const storedQuestions = {
    web: [
      {
        id: 'web-q1',
        type: 'qcm' as const,
        question: 'Quelle vulnérabilité OWASP permet l\'injection de code malveillant dans une page web?',
        options: ['XSS (Cross-Site Scripting)', 'CSRF (Cross-Site Request Forgery)', 'SQL Injection', 'Directory Traversal'],
        correctAnswer: ['XSS (Cross-Site Scripting)'],
        explanation: 'XSS permet d\'injecter du code JavaScript malveillant qui s\'exécute dans le navigateur des utilisateurs.'
      },
      {
        id: 'web-q2',
        type: 'qcm' as const,
        question: 'Quelle mesure protège le mieux contre les attaques CSRF?',
        options: ['Validation des entrées', 'Tokens anti-CSRF', 'Chiffrement HTTPS', 'Authentification forte'],
        correctAnswer: ['Tokens anti-CSRF'],
        explanation: 'Les tokens anti-CSRF garantissent que la requête provient bien du site légitime.'
      },
      {
        id: 'web-q3',
        type: 'qcm' as const,
        question: 'Quelle injection permet de manipuler directement la base de données?',
        options: ['SQL Injection', 'XSS', 'LDAP Injection', 'Command Injection'],
        correctAnswer: ['SQL Injection'],
        explanation: 'L\'injection SQL permet de manipuler les requêtes vers la base de données.'
      },
      {
        id: 'web-q4',
        type: 'qcm' as const,
        question: 'Quel en-tête HTTP aide à prévenir les attaques de clickjacking?',
        options: ['X-Frame-Options', 'X-XSS-Protection', 'Content-Security-Policy', 'Tous les précédents'],
        correctAnswer: ['X-Frame-Options'],
        explanation: 'X-Frame-Options empêche l\'inclusion de la page dans une iframe.'
      },
      {
        id: 'web-q5',
        type: 'qcm' as const,
        question: 'Quelle vulnérabilité permet l\'accès à des fichiers système?',
        options: ['Directory Traversal', 'XSS', 'CSRF', 'Injection SQL'],
        correctAnswer: ['Directory Traversal'],
        explanation: 'Directory Traversal exploite des chemins relatifs pour accéder à des fichiers non autorisés.'
      }
    ],
    network: [
      {
        id: 'net-q1',
        type: 'qcm' as const,
        question: 'Quel protocole sécurise les communications au niveau transport?',
        options: ['TLS/SSL', 'IPSec', 'SSH', 'HTTPS'],
        correctAnswer: ['TLS/SSL'],
        explanation: 'TLS/SSL opère au niveau transport pour chiffrer les communications.'
      },
      {
        id: 'net-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce qu\'un IDS?',
        options: ['Intrusion Detection System', 'Internet Data System', 'Internal Defense System', 'Integrated Data Security'],
        correctAnswer: ['Intrusion Detection System'],
        explanation: 'IDS détecte les tentatives d\'intrusion sur le réseau.'
      },
      {
        id: 'net-q3',
        type: 'qcm' as const,
        question: 'Quel port utilise HTTPS par défaut?',
        options: ['443', '80', '22', '21'],
        correctAnswer: ['443'],
        explanation: 'HTTPS utilise le port 443 pour les connexions sécurisées.'
      },
      {
        id: 'net-q4',
        type: 'qcm' as const,
        question: 'Quelle attaque exploite les protocoles de routage?',
        options: ['BGP Hijacking', 'ARP Spoofing', 'DNS Poisoning', 'Toutes les précédentes'],
        correctAnswer: ['BGP Hijacking'],
        explanation: 'BGP Hijacking détourne le trafic en annonçant de fausses routes.'
      },
      {
        id: 'net-q5',
        type: 'qcm' as const,
        question: 'Que signifie DDoS?',
        options: ['Distributed Denial of Service', 'Direct Data Override System', 'Dynamic DNS Operation Service', 'Data Destruction on Server'],
        correctAnswer: ['Distributed Denial of Service'],
        explanation: 'DDoS utilise plusieurs sources pour saturer une cible.'
      }
    ],
    system: [
      {
        id: 'sys-q1',
        type: 'qcm' as const,
        question: 'Quel principe de sécurité limite les privilèges au minimum nécessaire?',
        options: ['Principe du moindre privilège', 'Défense en profondeur', 'Séparation des devoirs', 'Authentification forte'],
        correctAnswer: ['Principe du moindre privilège'],
        explanation: 'Ce principe limite les droits d\'accès au strict minimum nécessaire.'
      },
      {
        id: 'sys-q2',
        type: 'qcm' as const,
        question: 'Qu\'est-ce que le durcissement (hardening) système?',
        options: ['Réduction de la surface d\'attaque', 'Augmentation des performances', 'Installation de logiciels', 'Sauvegarde des données'],
        correctAnswer: ['Réduction de la surface d\'attaque'],
        explanation: 'Le hardening consiste à réduire les vulnérabilités et services inutiles.'
      }
    ],
    crypto: [
      {
        id: 'crypto-q1',
        type: 'qcm' as const,
        question: 'Quelle est la différence principale entre chiffrement symétrique et asymétrique?',
        options: ['Nombre de clés utilisées', 'Vitesse de chiffrement', 'Taille des données', 'Algorithme utilisé'],
        correctAnswer: ['Nombre de clés utilisées'],
        explanation: 'Symétrique utilise une clé, asymétrique utilise une paire de clés publique/privée.'
      }
    ],
    incident: [
      {
        id: 'inc-q1',
        type: 'qcm' as const,
        question: 'Quelle est la première étape de gestion d\'incident?',
        options: ['Détection et analyse', 'Endiguement', 'Éradication', 'Récupération'],
        correctAnswer: ['Détection et analyse'],
        explanation: 'Il faut d\'abord détecter et analyser l\'incident avant d\'agir.'
      }
    ],
    governance: [
      {
        id: 'gov-q1',
        type: 'qcm' as const,
        question: 'Que signifie ISO 27001?',
        options: ['Norme de management de la sécurité', 'Protocole de chiffrement', 'Standard de réseau', 'Méthode d\'audit'],
        correctAnswer: ['Norme de management de la sécurité'],
        explanation: 'ISO 27001 est la norme internationale de management de la sécurité de l\'information.'
      }
    ],
    cloud: [
      {
        id: 'cloud-q1',
        type: 'qcm' as const,
        question: 'Quel modèle de responsabilité partagée s\'applique au cloud?',
        options: ['Fournisseur: infrastructure, Client: données', 'Client: tout', 'Fournisseur: tout', 'Aucun modèle'],
        correctAnswer: ['Fournisseur: infrastructure, Client: données'],
        explanation: 'Le modèle de responsabilité partagée répartit les responsabilités entre fournisseur et client.'
      }
    ],
    iot: [
      {
        id: 'iot-q1',
        type: 'qcm' as const,
        question: 'Quel protocole est spécifique aux réseaux industriels?',
        options: ['Modbus', 'HTTP', 'FTP', 'SMTP'],
        correctAnswer: ['Modbus'],
        explanation: 'Modbus est un protocole de communication industriel largement utilisé.'
      }
    ]
  };
  const [activeTab, setActiveTab] = useState<string>('standardTest');

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Mock options
  const mockOptions = {
    categories: [
      { id: 'web', name: 'Sécurité Web', description: 'Applications web, OWASP, injections' },
      { id: 'network', name: 'Sécurité Réseau', description: 'Pare-feu, IDS/IPS, protocoles' },
      { id: 'system', name: 'Sécurité Système', description: 'OS, permissions, durcissement' },
      { id: 'crypto', name: 'Cryptographie', description: 'Chiffrement, PKI, signatures' },
      { id: 'incident', name: 'Gestion d\'incidents', description: 'Réponse, forensique, continuité' },
      { id: 'governance', name: 'Gouvernance & Conformité', description: 'ISO 27001, RGPD, audits' },
      { id: 'cloud', name: 'Sécurité Cloud', description: 'AWS, Azure, conteneurs' },
      { id: 'iot', name: 'IoT & OT', description: 'Objets connectés, SCADA, industrie' }
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

  // Generate questions mutation with Azure OpenAI and stored questions
  const generateQuestionsMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update progress during generation
      const progressInterval = setInterval(() => {
        setGenerateProgress(prev => {
          const newValue = prev + 20;
          if (newValue >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newValue;
        });
      }, 200);

      try {
        // Use stored questions by default to minimize API calls
        if (data.useStored && storedQuestions[data.category as keyof typeof storedQuestions]) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
          clearInterval(progressInterval);
          setGenerateProgress(100);
          
          const categoryQuestions = storedQuestions[data.category as keyof typeof storedQuestions];
          const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 10);
          
          return { questions: selected };
        }

        // Fallback to Azure OpenAI if stored questions not available or explicitly requested
        const categoryInfo = mockOptions.categories.find(c => c.id === data.category);
        const difficultyInfo = mockOptions.difficulties.find(d => d.id === data.difficulty);
        
        const prompt = `Génère exactement 10 questions de cybersécurité pour un test technique.
        
Paramètres:
- Catégorie: ${categoryInfo?.name} (${categoryInfo?.description})
- Niveau: ${difficultyInfo?.name} (${difficultyInfo?.description})
- Type: ${data.exerciseType}

Génère un JSON avec exactement 10 questions variées et progressives. Format:
{
  "questions": [
    {
      "id": "q1",
      "type": "${data.exerciseType}",
      "question": "Question claire et précise",
      ${data.exerciseType === 'qcm' ? '"options": ["Option 1", "Option 2", "Option 3", "Option 4"],' : ''}
      "correctAnswer": ${data.exerciseType === 'qcm' ? '["Bonne réponse"]' : '"Réponse attendue détaillée"'},
      "explanation": "Explication pédagogique de la réponse"
    }
  ]
}

Les questions doivent être techniques, réalistes et couvrir différents aspects de la catégorie choisie.`;

        const response = await fetch('/api/openai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'Tu es un expert en cybersécurité qui crée des tests techniques de qualité professionnelle. Réponds uniquement en JSON valide.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7
          })
        });

        clearInterval(progressInterval);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.choices?.[0]?.message?.content) {
          const questionsData = JSON.parse(result.choices[0].message.content);
          return questionsData;
        } else {
          throw new Error('Réponse invalide de l\'IA');
        }
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
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
    setStep('select');
  };

  // Function to handle response change
  const handleResponseChange = (questionId: string, response: string | string[]) => {
    setResponses(prev => 
      prev.map(r => 
        r.questionId === questionId 
          ? { ...r, response }
          : r
      )
    );
  };

  // Evaluate test with Azure OpenAI
  const evaluateTestMutation = useMutation({
    mutationFn: async () => {
      const categoryInfo = mockOptions.categories.find(c => c.id === selectedCategory);
      const difficultyInfo = mockOptions.difficulties.find(d => d.id === selectedDifficulty);
      
      const testData = {
        category: categoryInfo?.name,
        difficulty: difficultyInfo?.name,
        questions: questions.map(q => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          userResponse: responses.find(r => r.questionId === q.id)?.response || '',
          type: q.type
        }))
      };

      const prompt = `Analyse ce test technique de cybersécurité et fournis un feedback objectif et professionnel.

Données du test:
- Catégorie: ${testData.category}
- Niveau déclaré: ${testData.difficulty}
- Nombre de questions: ${testData.questions.length}

Questions et réponses:
${testData.questions.map((q, i) => `
Question ${i+1}: ${q.question}
Réponse attendue: ${q.correctAnswer}
Réponse de l'utilisateur: ${q.userResponse}
`).join('')}

Fournis une analyse JSON avec:
{
  "score": nombre_points_obtenus,
  "maxScore": ${testData.questions.length},
  "percentage": pourcentage_global,
  "feedback": "Analyse objective et constructive du profil",
  "detailedAnalysis": {
    "strengths": ["Point fort 1", "Point fort 2"],
    "weaknesses": ["Point à améliorer 1", "Point à améliorer 2"],
    "levelConsistency": "Analyse de la cohérence avec le niveau déclaré",
    "recommendations": ["Recommandation 1", "Recommandation 2"],
    "professionalProfile": "Évaluation du profil professionnel"
  },
  "detailedResults": [
    {
      "questionId": "q1",
      "correct": true/false,
      "feedback": "Explication de la correction"
    }
  ]
}

Sois objectif, constructif et professionnel dans ton analyse.`;

      const response = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en cybersécurité qui évalue des tests techniques. Fournis des analyses objectives et constructives. Réponds uniquement en JSON valide.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.choices?.[0]?.message?.content) {
        return JSON.parse(result.choices[0].message.content);
      } else {
        throw new Error('Impossible d\'évaluer le test');
      }
    },
    onSuccess: (results) => {
      setEvaluationResults(results);
      setStep('results');
    },
    onError: (error) => {
      toast({
        title: 'Erreur d\'évaluation',
        description: 'Impossible d\'analyser vos résultats. Veuillez réessayer.',
        variant: 'destructive',
      });
    }
  });

  // Function to go to next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Finish test and evaluate with AI
      evaluateTestMutation.mutate();
    }
  };

  // Function to restart test
  const restartTest = () => {
    setStep('select');
    setQuestions([]);
    setResponses([]);
    setCurrentQuestion(0);
    setEvaluationResults(null);
    setGenerateProgress(0);
  };

  // Function to render the user name field with "Bientôt disponible" label
  const renderNameField = () => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Votre nom (à afficher sur le certificat)
        </label>
        <div className="relative">
          <input 
            type="text" 
            className="flex h-10 w-full rounded-md border border-blue-700 bg-blue-900/50 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed opacity-50"
            placeholder="Ex: Julien Grimault"
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

      <div className="space-y-4">
        {/* Option pour choisir le type de questions */}
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Source des questions
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer text-white">
              <input
                type="radio"
                checked={useStoredQuestions}
                onChange={() => setUseStoredQuestions(true)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span>Questions pré-validées (recommandé)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer text-white">
              <input
                type="radio"
                checked={!useStoredQuestions}
                onChange={() => setUseStoredQuestions(false)}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span>Générer avec IA</span>
            </label>
          </div>
          <p className="text-xs text-blue-300 mt-1">
            {useStoredQuestions 
              ? 'Utilise notre banque de questions validées par des experts' 
              : 'Génère des questions personnalisées avec Azure OpenAI'}
          </p>
        </div>

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

  // Quiz view - Display questions
  const renderQuizView = () => {
    if (questions.length === 0) return null;

    const currentQ = questions[currentQuestion];
    const currentResponse = responses.find(r => r.questionId === currentQ.id);

    return (
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Question {currentQuestion + 1} sur {questions.length}</span>
            <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
          </div>
          <Progress 
            value={((currentQuestion + 1) / questions.length) * 100} 
            className="h-2 bg-blue-950"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
          />
        </div>

        {/* Question */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{currentQ.question}</h3>
          
          {currentQ.type === 'qcm' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer text-white">
                  <input
                    type="radio"
                    name={currentQ.id}
                    checked={currentResponse?.response === option}
                    onChange={() => handleResponseChange(currentQ.id, option)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'text' && (
            <Textarea
              value={currentResponse?.response as string || ''}
              onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
              placeholder="Saisissez votre réponse..."
              className="min-h-[120px] bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
            />
          )}

          {currentQ.type === 'code' && currentQ.code && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded p-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{currentQ.code}</code>
                </pre>
              </div>
              <Textarea
                value={currentResponse?.response as string || ''}
                onChange={(e) => handleResponseChange(currentQ.id, e.target.value)}
                placeholder="Analysez le code et décrivez les vulnérabilités trouvées..."
                className="min-h-[120px] bg-blue-900/50 border-blue-700 text-white placeholder:text-blue-400"
              />
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
            className="bg-blue-900/20 border-blue-700 text-white hover:bg-blue-800/30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          
          <Button
            onClick={nextQuestion}
            disabled={!currentResponse?.response}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Results view with detailed AI feedback
  const renderResultsView = () => {
    if (!evaluationResults) {
      return (
        <div className="text-center">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-400 mb-4" />
            <p className="text-white">Analyse de vos résultats en cours...</p>
            <p className="text-blue-200 text-sm mt-2">Notre IA évalue vos réponses pour vous fournir un feedback détaillé</p>
          </div>
        </div>
      );
    }

    const detailedAnalysis = (evaluationResults as any).detailedAnalysis;

    return (
      <div className="space-y-6">
        {/* Score global */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Résultats du test</h2>
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-blue-300 mb-2">
              {evaluationResults.percentage}%
            </div>
            <div className="text-white mb-4">
              {evaluationResults.score} / {evaluationResults.maxScore} points
            </div>
            <p className="text-blue-200">{evaluationResults.feedback}</p>
          </div>
        </div>

        {/* Analyse détaillée */}
        {detailedAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points forts */}
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-3">Points forts</h3>
              <ul className="space-y-2">
                {detailedAnalysis.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="text-green-100 text-sm flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Points à améliorer */}
            <div className="bg-amber-900/20 border border-amber-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-300 mb-3">Points à améliorer</h3>
              <ul className="space-y-2">
                {detailedAnalysis.weaknesses?.map((weakness: string, index: number) => (
                  <li key={index} className="text-amber-100 text-sm flex items-start">
                    <span className="text-amber-400 mr-2">→</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Analyse du profil */}
        {detailedAnalysis && (
          <div className="space-y-4">
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Cohérence du profil</h3>
              <p className="text-blue-200 text-sm">{detailedAnalysis.levelConsistency}</p>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">Profil professionnel</h3>
              <p className="text-blue-200 text-sm">{detailedAnalysis.professionalProfile}</p>
            </div>

            {detailedAnalysis.recommendations && (
              <div className="bg-indigo-900/20 border border-indigo-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-300 mb-3">Recommandations</h3>
                <ul className="space-y-2">
                  {detailedAnalysis.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-indigo-100 text-sm flex items-start">
                      <span className="text-indigo-400 mr-2">💡</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <Button
            onClick={restartTest}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            Nouveau test
          </Button>
        </div>
      </div>
    );
  };

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
            onClick={() => setLocation('/cyber/roleplay')}
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

        {step === 'select' && (
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
        )}

        {step === 'quiz' && (
          <Card className="bg-gradient-to-b from-blue-950 to-slate-950 border-blue-800 text-white shadow-xl border">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Test en cours</CardTitle>
              <CardDescription className="text-blue-200">
                Répondez aux questions pour évaluer vos compétences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderQuizView()}
            </CardContent>
          </Card>
        )}

        {step === 'results' && (
          <Card className="bg-gradient-to-b from-blue-950 to-slate-950 border-blue-800 text-white shadow-xl border">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Test terminé</CardTitle>
              <CardDescription className="text-blue-200">
                Découvrez vos résultats et votre niveau de maîtrise.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderResultsView()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}