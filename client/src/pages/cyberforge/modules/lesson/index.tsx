import { useState, useEffect, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, ArrowRight, BookOpen, Code, Terminal, HelpCircle, CheckCircle, ChevronRight, ChevronLeft, Play, MousePointer, MessageSquare, RotateCw, Loader, Shield, Bookmark, Star, Star as StarIcon, Link, Info, AlertTriangle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LessonContent {
  id: string;
  moduleId: string;
  chapterId: string;
  title: string;
  type: 'theory' | 'practice' | 'challenge' | 'quiz';
  sections: LessonSection[];
  assessment: Assessment | null;
  duration: string;
  points: number;
  nextLessonId: string | null;
  prevLessonId: string | null;
}

interface LessonSection {
  id: string;
  type: 'text' | 'code' | 'image' | 'video' | 'interactive' | 'terminal';
  title?: string;
  content: string;
  codeLanguage?: string;
  interactionType?: 'click' | 'drag' | 'input' | 'terminal';
  expectedAnswer?: string;
}

interface Assessment {
  id: string;
  type: 'quiz' | 'challenge';
  questions: AssessmentQuestion[];
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'short_answer' | 'true_false' | 'interactive';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

interface AIResponse {
  response: string;
  isLoading: boolean;
  error: string | null;
}

function CybergForgeLesson() {
  const [, setLocation] = useLocation();
  const [_, params] = useRoute('/cyberforge/modules/:moduleId/:chapterId/:lessonId');
  const { themeMode, isDark } = useTheme();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[]>>({});
  const [userCodeInput, setUserCodeInput] = useState<Record<string, string>>({});
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
  } | null>(null);
  
  // État pour les interactions avec l'IA
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse>({
    response: '',
    isLoading: false,
    error: null
  });
  
  // Référence pour la section actuelle
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Exemple de contenu de leçon
  const lessonContent: LessonContent = {
    id: 'foundations-1-1',
    moduleId: 'foundations',
    chapterId: 'foundations-1',
    title: 'Qu\'est-ce que la cybersécurité ?',
    type: 'theory',
    duration: '15 min',
    points: 25,
    nextLessonId: 'foundations-1-2',
    prevLessonId: null,
    sections: [
      {
        id: 'section-1',
        type: 'text',
        title: 'Introduction à la cybersécurité',
        content: `
          La cybersécurité est l'ensemble des techniques, processus et pratiques conçus pour protéger les réseaux, 
          dispositifs, programmes et données contre les attaques, dommages ou accès non autorisés.
          
          Dans un monde de plus en plus connecté, la cybersécurité est devenue une priorité absolue pour les 
          organisations et les individus. Les cyberattaques peuvent entraîner des pertes financières significatives, 
          des atteintes à la réputation et même des problèmes de sécurité nationale.
        `
      },
      {
        id: 'section-2',
        type: 'image',
        content: 'https://source.unsplash.com/random/800x400/?cybersecurity'
      },
      {
        id: 'section-3',
        type: 'text',
        title: 'Pourquoi la cybersécurité est-elle importante ?',
        content: `
          L'importance de la cybersécurité augmente à mesure que le monde devient plus dépendant des technologies numériques. 
          Voici quelques raisons pour lesquelles la cybersécurité est cruciale :
          
          1. **Protection des données sensibles** : Informations personnelles, propriété intellectuelle, données financières
          2. **Continuité des opérations** : Prévenir les interruptions causées par les cyberattaques
          3. **Préservation de la confiance** : Maintenir la confiance des clients et partenaires
          4. **Conformité réglementaire** : Respecter les lois et réglementations sur la protection des données
        `
      },
      {
        id: 'section-4',
        type: 'code',
        title: 'Exemple de code d\'authentification simple',
        codeLanguage: 'javascript',
        content: `// Exemple simplifié d'authentification
function verifyUser(username, password) {
  // Ne jamais stocker les mots de passe en clair en production !
  const users = {
    'admin': 'securePassword123',
    'user1': 'userPassword456'
  };
  
  // Vérification basique - dans la pratique, utilisez des méthodes sécurisées
  if (users[username] === password) {
    return { authenticated: true, message: 'Authentification réussie' };
  }
  
  return { authenticated: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' };
}`
      },
      {
        id: 'section-5',
        type: 'interactive',
        title: 'Identification des vulnérabilités',
        interactionType: 'click',
        content: `Identifiez les problèmes de sécurité dans le code précédent. Cliquez sur les éléments problématiques.

1. Stockage des mots de passe en clair
2. Absence de chiffrement
3. Absence de protection contre les attaques par force brute
4. Comparaison directe des chaînes de caractères

Cliquez sur tous les problèmes de sécurité présents dans le code.`
      },
      {
        id: 'section-6',
        type: 'text',
        title: 'Principes fondamentaux de la cybersécurité',
        content: `La cybersécurité repose sur trois principes fondamentaux, souvent appelés la triade CIA :

1. **Confidentialité** : S'assurer que les informations ne sont accessibles qu'aux personnes autorisées.
2. **Intégrité** : Maintenir l'exactitude et la fiabilité des données tout au long de leur cycle de vie.
3. **Disponibilité** : Garantir que les informations et les systèmes sont disponibles quand ils sont nécessaires.

Ces trois principes sont interdépendants et constituent la base de toute stratégie de cybersécurité efficace.`
      }
    ],
    assessment: {
      id: 'assessment-1',
      type: 'quiz',
      questions: [
        {
          id: 'q1',
          question: 'Qu\'est-ce que la triade CIA en cybersécurité ?',
          type: 'mcq',
          options: [
            'Central Intelligence Agency, Investigation, Authorization',
            'Confidentialité, Intégrité, Authentification',
            'Confidentialité, Intégrité, Disponibilité (Availability)',
            'Cryptographie, Investigation, Analyse'
          ],
          correctAnswer: 'Confidentialité, Intégrité, Disponibilité (Availability)',
          explanation: 'La triade CIA est un modèle conçu pour guider les politiques de sécurité de l\'information. Elle représente les trois principes fondamentaux de la sécurité : Confidentialité, Intégrité et Disponibilité (Availability).'
        },
        {
          id: 'q2',
          question: 'Pourquoi ne devrait-on jamais stocker les mots de passe en clair ?',
          type: 'short_answer',
          correctAnswer: ['vol', 'compromis', 'fuite', 'hacker', 'sécurité'],
          explanation: 'Les mots de passe ne doivent jamais être stockés en clair car en cas de violation de données, les attaquants auraient un accès immédiat à tous les comptes. Les mots de passe doivent être hachés avec un sel cryptographique.'
        },
        {
          id: 'q3',
          question: 'La cybersécurité concerne uniquement la protection contre les hackers externes.',
          type: 'true_false',
          options: ['Vrai', 'Faux'],
          correctAnswer: 'Faux',
          explanation: 'La cybersécurité concerne la protection contre les menaces externes ET internes. Les menaces internes peuvent provenir d\'employés malveillants ou négligents et sont souvent plus dangereuses car elles impliquent des personnes ayant déjà accès aux systèmes.'
        }
      ]
    }
  };
  
  // Fonction pour générer une réponse IA à une question de l'utilisateur
  const generateAIResponse = async () => {
    if (!aiQuery.trim()) return;
    
    setAiResponse({
      ...aiResponse,
      isLoading: true,
      error: null
    });
    
    try {
      // Simuler un appel API à un modèle IA
      const response = await axios.post('/api/cyberforge/assist', {
        query: aiQuery,
        context: {
          lessonId: lessonContent.id,
          lessonTitle: lessonContent.title,
          moduleId: lessonContent.moduleId,
          chapterId: lessonContent.chapterId
        }
      });
      
      // Dans un environnement réel, nous utiliserions la réponse de l'API
      // Ici, nous simulons une réponse
      setTimeout(() => {
        const simulatedResponse = `
Votre question: "${aiQuery}"

En abordant la cybersécurité, il est important de comprendre que c'est un domaine multidisciplinaire qui touche à la fois à l'informatique, au droit, à la psychologie et même à l'éthique.

Pour répondre à votre question plus spécifiquement:
${getSimulatedAIResponse(aiQuery)}

Est-ce que cette réponse est utile ? Avez-vous d'autres questions sur ce sujet ?
        `;
        
        setAiResponse({
          response: simulatedResponse,
          isLoading: false,
          error: null
        });
      }, 1500);
    } catch (error) {
      setAiResponse({
        ...aiResponse,
        isLoading: false,
        error: 'Une erreur est survenue lors de la génération de la réponse. Veuillez réessayer.'
      });
    }
  };
  
  // Fonction pour simuler une réponse IA basée sur la question
  const getSimulatedAIResponse = (query: string): string => {
    // Cette fonction simule des réponses basées sur des mots-clés
    // Dans une implémentation réelle, nous utiliserions un modèle d'IA
    const keywords = {
      'triade': 'La triade CIA (Confidentialité, Intégrité, Disponibilité) est le fondement conceptuel de la cybersécurité. Chaque principe représente un aspect essentiel de la protection des données et des systèmes.',
      'principe': 'Les principes fondamentaux de la cybersécurité comprennent la défense en profondeur, le principe du moindre privilège, la séparation des tâches, et la conception sécurisée par défaut.',
      'attaque': 'Les types d\'attaques courants incluent le phishing, les attaques par force brute, les attaques par déni de service (DoS), les injections SQL et les attaques d\'ingénierie sociale.',
      'mot de passe': 'Les bonnes pratiques pour les mots de passe incluent l\'utilisation de phrases de passe longues, l\'authentification à deux facteurs, et l\'utilisation de gestionnaires de mots de passe.',
      'hacker': 'Les hackers sont classés en différentes catégories : white hat (éthiques), black hat (malveillants), et grey hat (entre les deux). Les hackers éthiques aident à identifier les vulnérabilités avant qu\'elles ne soient exploitées malicieusement.',
      'cryptographie': 'La cryptographie est l\'art de protéger l\'information en la transformant (chiffrement) afin de la rendre illisible sans une clé spéciale. Elle est essentielle pour sécuriser les communications sur Internet.',
      'malware': 'Les malwares incluent les virus, les vers, les chevaux de Troie, les ransomwares, les spywares et les adwares. Chacun a des mécanismes et des objectifs différents.',
      'formation': 'La formation en cybersécurité pour les employés est cruciale car l\'erreur humaine est souvent le maillon faible dans la chaîne de sécurité. Des employés bien formés constituent votre première ligne de défense.',
      'métier': 'Les métiers en cybersécurité sont variés : analyste en sécurité, pentester, responsable de la sécurité des systèmes d\'information (RSSI), auditeur, ingénieur en sécurité, etc.'
    };
    
    const lowerQuery = query.toLowerCase();
    let response = 'La cybersécurité est un domaine vaste et en constante évolution. Pour approfondir ce sujet spécifique, je vous recommande de consulter des ressources spécialisées comme les publications du NIST ou de l\'ANSSI.';
    
    for (const [keyword, content] of Object.entries(keywords)) {
      if (lowerQuery.includes(keyword)) {
        response = content;
        break;
      }
    }
    
    return response;
  };
  
  const nextSection = () => {
    if (currentSection < lessonContent.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setShowAssessment(true);
    }
  };
  
  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  const handleMCQAnswer = (questionId: string, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer
    });
  };
  
  const handleShortAnswer = (questionId: string, answer: string) => {
    setUserAnswers({
      ...userAnswers,
      [questionId]: answer.trim().toLowerCase()
    });
  };
  
  const handleCodeInput = (sectionId: string, code: string) => {
    setUserCodeInput({
      ...userCodeInput,
      [sectionId]: code
    });
  };
  
  const submitAssessment = () => {
    if (!lessonContent.assessment) return;
    
    let score = 0;
    const total = lessonContent.assessment.questions.length;
    
    lessonContent.assessment.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      
      if (question.type === 'mcq' || question.type === 'true_false') {
        if (userAnswer === question.correctAnswer) {
          score++;
        }
      } else if (question.type === 'short_answer' && userAnswer) {
        const correctAnswers = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer 
          : [question.correctAnswer];
        
        // Vérifier si la réponse de l'utilisateur contient un des mots-clés attendus
        if (correctAnswers.some(keyword => 
          userAnswer.toString().toLowerCase().includes(keyword.toLowerCase()))) {
          score++;
        }
      }
    });
    
    const passed = (score / total) >= 0.7; // 70% pour réussir
    
    setAssessmentResult({
      score,
      total,
      passed
    });
    
    if (passed) {
      setLessonCompleted(true);
    }
  };
  
  const resetAssessment = () => {
    setUserAnswers({});
    setAssessmentResult(null);
  };
  
  const completeLesson = () => {
    // Dans une implémentation réelle, nous enverrions cette information au backend
    setLessonCompleted(true);
  };
  
  const goToNextLesson = () => {
    if (lessonContent.nextLessonId) {
      // Navigation vers la leçon suivante
      setLocation(`/cyberforge/modules/${lessonContent.moduleId}/${lessonContent.chapterId}/${lessonContent.nextLessonId}`);
    }
  };
  
  const goToPrevLesson = () => {
    if (lessonContent.prevLessonId) {
      // Navigation vers la leçon précédente
      setLocation(`/cyberforge/modules/${lessonContent.moduleId}/${lessonContent.chapterId}/${lessonContent.prevLessonId}`);
    }
  };
  
  const backToModuleList = () => {
    setLocation(`/cyberforge/modules/${lessonContent.moduleId}`);
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header avec navigation */}
      <header className={`py-4 px-6 ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-md sticky top-0 z-10`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className={`text-xl font-bold font-mono tracking-tight ${
              isDark 
                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text' 
                : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-transparent bg-clip-text'
            }`}>
              CyberForge<span className={isDark ? 'text-blue-300' : 'text-blue-700'}>_</span>Academy
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={backToModuleList}
              className={`flex items-center gap-1 ${
                isDark 
                  ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-800 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Modules</span>
            </Button>
            
            <div className="flex items-center gap-1">
              <StarIcon className={`h-4 w-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <span className="text-sm font-medium">{lessonContent.points} XP</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-4 items-start">
          {/* Contenu principal de la leçon */}
          <div className="flex-1">
            {showAssessment ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key="assessment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className={`p-6 rounded-xl ${
                    isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                  } shadow-md`}>
                    <h2 className="text-2xl font-bold mb-4">Évaluation finale</h2>
                    <p className="mb-6">
                      Répondez aux questions suivantes pour valider vos connaissances. 
                      Vous devez obtenir au moins 70% de bonnes réponses pour réussir cette évaluation.
                    </p>
                    
                    {assessmentResult ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg ${
                          assessmentResult.passed 
                            ? isDark ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200'
                            : isDark ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            {assessmentResult.passed ? (
                              <CheckCircle className={isDark ? 'text-green-400' : 'text-green-600'} />
                            ) : (
                              <div className={isDark ? 'text-red-400' : 'text-red-600'}>
                                <AlertTriangle />
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-medium">
                                {assessmentResult.passed 
                                  ? 'Félicitations !' 
                                  : 'Essayez à nouveau'
                                }
                              </h3>
                              <p>
                                Votre score : {assessmentResult.score}/{assessmentResult.total} ({Math.round((assessmentResult.score / assessmentResult.total) * 100)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {assessmentResult.passed ? (
                          <div className="flex gap-3 justify-end">
                            <Button 
                              onClick={goToNextLesson}
                              disabled={!lessonContent.nextLessonId}
                              className={isDark 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-blue-700 hover:bg-blue-800 text-white'
                              }
                            >
                              Leçon suivante
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-3 justify-end">
                            <Button 
                              variant="outline"
                              onClick={resetAssessment}
                              className={
                                isDark 
                                  ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' 
                                  : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                              }
                            >
                              <RotateCw className="mr-2 h-4 w-4" />
                              Réessayer
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {lessonContent.assessment?.questions.map((question, index) => (
                          <div 
                            key={question.id} 
                            className={`p-4 rounded-lg ${
                              isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <h3 className="text-lg font-medium mb-3">
                              Question {index + 1}: {question.question}
                            </h3>
                            
                            {question.type === 'mcq' && (
                              <div className="space-y-2">
                                {question.options?.map((option) => (
                                  <label 
                                    key={option} 
                                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${
                                      userAnswers[question.id] === option
                                        ? isDark 
                                          ? 'bg-blue-900/50 border border-blue-800' 
                                          : 'bg-blue-50 border border-blue-200'
                                        : isDark 
                                          ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' 
                                          : 'bg-white border border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    <input 
                                      type="radio" 
                                      name={question.id} 
                                      value={option}
                                      checked={userAnswers[question.id] === option}
                                      onChange={() => handleMCQAnswer(question.id, option)}
                                      className="sr-only"
                                    />
                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                      userAnswers[question.id] === option
                                        ? isDark 
                                          ? 'border-blue-500 bg-blue-600' 
                                          : 'border-blue-600 bg-blue-600'
                                        : isDark 
                                          ? 'border-gray-500' 
                                          : 'border-gray-300'
                                    }`}>
                                      {userAnswers[question.id] === option && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            
                            {question.type === 'short_answer' && (
                              <div>
                                <Textarea 
                                  value={userAnswers[question.id] as string || ''}
                                  onChange={(e) => handleShortAnswer(question.id, e.target.value)}
                                  placeholder="Votre réponse..."
                                  className={isDark 
                                    ? 'bg-gray-800 border-gray-700 text-white' 
                                    : 'bg-white border-gray-300'
                                  }
                                />
                              </div>
                            )}
                            
                            {question.type === 'true_false' && (
                              <div className="flex gap-3">
                                {question.options?.map((option) => (
                                  <label 
                                    key={option} 
                                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer ${
                                      userAnswers[question.id] === option
                                        ? isDark 
                                          ? 'bg-blue-900/50 border border-blue-800' 
                                          : 'bg-blue-50 border border-blue-200'
                                        : isDark 
                                          ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700' 
                                          : 'bg-white border border-gray-200 hover:bg-gray-100'
                                    }`}
                                  >
                                    <input 
                                      type="radio" 
                                      name={question.id} 
                                      value={option}
                                      checked={userAnswers[question.id] === option}
                                      onChange={() => handleMCQAnswer(question.id, option)}
                                      className="sr-only"
                                    />
                                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                                      userAnswers[question.id] === option
                                        ? isDark 
                                          ? 'border-blue-500 bg-blue-600' 
                                          : 'border-blue-600 bg-blue-600'
                                        : isDark 
                                          ? 'border-gray-500' 
                                          : 'border-gray-300'
                                    }`}>
                                      {userAnswers[question.id] === option && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="flex justify-end gap-3 mt-6">
                          <Button 
                            variant="outline"
                            onClick={() => setShowAssessment(false)}
                            className={
                              isDark 
                                ? 'border-gray-600 bg-transparent text-white hover:bg-gray-700' 
                                : 'border-gray-300 text-gray-800 hover:bg-gray-100'
                            }
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Retour à la leçon
                          </Button>
                          
                          <Button 
                            onClick={submitAssessment}
                            className={isDark 
                              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                              : 'bg-blue-700 hover:bg-blue-800 text-white'
                            }
                          >
                            Soumettre
                            <CheckCircle className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="space-y-6" ref={sectionRef}>
                <div className={`p-6 rounded-xl ${
                  isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                } shadow-md`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-md ${
                      isDark ? 'bg-blue-600' : 'bg-blue-100'
                    }`}>
                      {lessonContent.type === 'theory' ? (
                        <BookOpen className={`h-5 w-5 ${isDark ? 'text-white' : 'text-blue-800'}`} />
                      ) : lessonContent.type === 'practice' ? (
                        <Code className={`h-5 w-5 ${isDark ? 'text-white' : 'text-blue-800'}`} />
                      ) : lessonContent.type === 'challenge' ? (
                        <Terminal className={`h-5 w-5 ${isDark ? 'text-white' : 'text-blue-800'}`} />
                      ) : (
                        <HelpCircle className={`h-5 w-5 ${isDark ? 'text-white' : 'text-blue-800'}`} />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold">{lessonContent.title}</h2>
                  </div>
                  
                  <div className={`mb-6 pb-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-300'}>
                          {lessonContent.type === 'theory' ? 'Théorie' : 
                           lessonContent.type === 'practice' ? 'Pratique' : 
                           lessonContent.type === 'challenge' ? 'Défi' : 'Quiz'}
                        </Badge>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Durée estimée: {lessonContent.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={isDark ? 'bg-blue-900 text-blue-200 border-0' : 'bg-blue-100 text-blue-800 border-0'}>
                          Section {currentSection + 1}/{lessonContent.sections.length}
                        </Badge>
                      </div>
                    </div>
                    
                    <Progress 
                      value={(currentSection / (lessonContent.sections.length - 1)) * 100} 
                      className={`h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
                      indicatorClassName={isDark ? 'bg-blue-600' : 'bg-blue-700'} 
                    />
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`section-${currentSection}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {lessonContent.sections[currentSection].type === 'text' && (
                        <div className="space-y-4">
                          {lessonContent.sections[currentSection].title && (
                            <h3 className="text-xl font-semibold">{lessonContent.sections[currentSection].title}</h3>
                          )}
                          <div className={`prose max-w-none ${isDark ? 'prose-invert' : ''} prose-p:text-base prose-p:leading-relaxed`}>
                            {lessonContent.sections[currentSection].content.split('\n\n').map((paragraph, i) => (
                              <p key={i} className="whitespace-pre-line">{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {lessonContent.sections[currentSection].type === 'code' && (
                        <div className="space-y-4">
                          {lessonContent.sections[currentSection].title && (
                            <h3 className="text-xl font-semibold">{lessonContent.sections[currentSection].title}</h3>
                          )}
                          <div className={`p-4 rounded-md ${isDark ? 'bg-gray-900' : 'bg-gray-100'} overflow-x-auto font-mono text-sm`}>
                            <pre className="whitespace-pre-wrap">{lessonContent.sections[currentSection].content}</pre>
                          </div>
                        </div>
                      )}
                      
                      {lessonContent.sections[currentSection].type === 'image' && (
                        <div className="space-y-4">
                          <img 
                            src={lessonContent.sections[currentSection].content}
                            alt="Illustration du cours"
                            className="w-full rounded-md object-cover max-h-[400px]"
                          />
                        </div>
                      )}
                      
                      {lessonContent.sections[currentSection].type === 'interactive' && (
                        <div className="space-y-4">
                          {lessonContent.sections[currentSection].title && (
                            <h3 className="text-xl font-semibold">{lessonContent.sections[currentSection].title}</h3>
                          )}
                          <div className={`p-6 rounded-lg ${
                            isDark ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                          }`}>
                            <div className="flex items-start gap-3 mb-4">
                              <MousePointer className={`h-5 w-5 mt-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
                              <div>
                                <p className="font-medium mb-2">Exercice interactif</p>
                                <p className="text-sm opacity-90">
                                  {lessonContent.sections[currentSection].content}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex justify-center">
                              <Button className={isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-700 hover:bg-blue-800'}>
                                <Play className="mr-2 h-4 w-4" />
                                Débuter l'exercice
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
                    <Button 
                      variant="outline" 
                      onClick={prevSection}
                      disabled={currentSection === 0}
                      className={`
                        ${isDark ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'}
                        ${currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Précédent
                    </Button>
                    
                    <Button 
                      onClick={nextSection}
                      className={isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-700 hover:bg-blue-800'}
                    >
                      {currentSection === lessonContent.sections.length - 1 ? 'Évaluation finale' : 'Suivant'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Assistant IA et navigation */}
          <div className="w-96 space-y-6 sticky top-24">
            <div className={`p-6 rounded-xl ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } shadow-md`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                Assistant IA CyberForge
              </h3>
              
              <div className="mb-4">
                <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Posez vos questions sur cette leçon ou obtenez des explications supplémentaires.
                </p>
                
                <div className={`p-3 rounded-md ${
                  isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'
                } mb-4 max-h-[200px] overflow-y-auto ${aiResponse.response ? 'block' : 'hidden'}`}>
                  <div className={`prose prose-sm max-w-none ${isDark ? 'prose-invert' : ''}`}>
                    <pre className="whitespace-pre-wrap font-sans">
                      {aiResponse.response}
                    </pre>
                  </div>
                </div>
                
                {aiResponse.error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{aiResponse.error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2">
                  <Textarea 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Poser une question..."
                    className={`resize-none ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  />
                  
                  <Button 
                    onClick={generateAIResponse}
                    disabled={!aiQuery.trim() || aiResponse.isLoading}
                    className={isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-700 hover:bg-blue-800'}
                  >
                    {aiResponse.isLoading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator className={isDark ? 'bg-gray-700' : 'bg-gray-200'} />
              
              <div className="mt-4 space-y-3">
                <h4 className="font-medium text-sm mb-2">Navigation</h4>
                
                <Button 
                  variant="outline" 
                  onClick={backToModuleList}
                  className={`w-full justify-start ${
                    isDark ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour au module
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={goToPrevLesson}
                    disabled={!lessonContent.prevLessonId}
                    className={`${
                      isDark ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-100'
                    } ${!lessonContent.prevLessonId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Précédent
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={goToNextLesson}
                    disabled={!lessonContent.nextLessonId}
                    className={`${
                      isDark ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'hover:bg-gray-100'
                    } ${!lessonContent.nextLessonId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Suivant
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Sauvegarder pour plus tard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CybergForgeLesson;