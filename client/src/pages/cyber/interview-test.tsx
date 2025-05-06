import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, TimerReset } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';

// Types de questions possibles
type QuestionType = 'presentation' | 'reflex' | 'incident' | 'analysis' | 'ethical' | 'client' | 'projection';

// Structure d'une question
interface Question {
  id: string;
  type: QuestionType;
  question: string;
  hint?: string;
  placeholder?: string;
}

// Structure pour les résultats d'évaluation
interface EvaluationResult {
  profile: string;
  strengths: string[];
  improvements: string[];
  badge: {
    name: string;
    justification: string;
  };
}

// État de test (en cours, terminé, etc.)
type TestState = 'intro' | 'in-progress' | 'submitting' | 'results';

// Liste des questions possibles
const QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'presentation',
    question: 'Présente-toi en tant que professionnel de la cybersécurité.',
    hint: 'Décris ton parcours, tes compétences et ton rôle actuel ou souhaité.',
    placeholder: 'Je suis un professionnel de la cybersécurité spécialisé dans...'
  },
  {
    id: 'q2',
    type: 'reflex',
    question: 'Un mail suspect arrive dans ta boîte de réception professionnelle. Quelles sont tes 3 premières actions ?',
    hint: 'Pense à la séquence d\'actions et aux précautions à prendre.',
    placeholder: 'Premièrement, je... Deuxièmement, je... Enfin, je...'
  },
  {
    id: 'q3',
    type: 'incident',
    question: 'Une attaque par ransomware vient de bloquer 3 serveurs critiques de l\'entreprise. Que fais-tu dans la première heure ?',
    hint: 'Pense à la gestion de crise immédiate, aux communications et aux actions techniques.',
    placeholder: 'Dans les premières minutes, je...'
  },
  {
    id: 'q4',
    type: 'analysis',
    question: 'Voici un extrait de logs de connexion suspects :\n\n192.168.1.25 - - [03/May/2025:02:14:12 +0100] "GET /admin/login.php HTTP/1.1" 200 4523\n192.168.1.25 - - [03/May/2025:02:14:15 +0100] "POST /admin/login.php HTTP/1.1" 401 289\n192.168.1.25 - - [03/May/2025:02:14:18 +0100] "POST /admin/login.php HTTP/1.1" 401 289\n192.168.1.25 - - [03/May/2025:02:14:19 +0100] "POST /admin/login.php HTTP/1.1" 401 289\n...(20 entrées similaires)...\n192.168.1.25 - - [03/May/2025:02:15:32 +0100] "POST /admin/login.php HTTP/1.1" 302 0\n192.168.1.25 - - [03/May/2025:02:15:33 +0100] "GET /admin/dashboard.php HTTP/1.1" 200 18345\n\nIdentifie et explique ce que tu observes.',
    hint: 'Recherche des motifs, des anomalies ou des indicateurs de comportement suspect.',
    placeholder: 'Je remarque que...'
  },
  {
    id: 'q5',
    type: 'ethical',
    question: 'Lors d\'un audit, tu identifies une faille de sécurité critique qui a été passée sous silence par ton supérieur. Quelle est ta réaction ?',
    hint: 'Réfléchis aux dimensions éthiques, légales et professionnelles de la situation.',
    placeholder: 'Face à cette situation, je...'
  },
  {
    id: 'q6',
    type: 'client',
    question: 'Un client refuse d\'implémenter une bonne pratique de sécurité essentielle pour des raisons de coût. Comment gères-tu cette situation ?',
    hint: 'Pense à l\'équilibre entre pédagogie, argumentation et prise en compte des contraintes du client.',
    placeholder: 'Pour convaincre le client...'
  },
  {
    id: 'q7',
    type: 'projection',
    question: 'Quelle est la menace cyber qui t\'inquiète le plus pour les 3 prochaines années et pourquoi ?',
    hint: 'Tu peux évoquer des tendances technologiques, géopolitiques ou sociétales.',
    placeholder: 'La menace qui m\'inquiète particulièrement est...'
  }
];

// Récupère uniquement la question de présentation
const getInitialQuestion = (): Question[] => {
  const presentationQuestion = QUESTIONS.find(q => q.type === 'presentation');

  return presentationQuestion ? [presentationQuestion] : [QUESTIONS[0]];
};

// Génère une question adaptative basée sur les réponses précédentes
const generateAdaptiveQuestion = async (
  presentationAnswer: string,
  currentQuestionIndex: number,
  previousAnswers: Array<{
    questionId: string;
    type: QuestionType;
    question: string;
    answer: string;
  }>
): Promise<Question | null> => {
  try {
    const response = await fetch('/api/cyber/interview-test/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        presentationAnswer,
        currentQuestionIndex,
        previousAnswers,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la question adaptative');
    }

    const data = await response.json();

    if (data.success) {
      return data.question;
    } else {
      throw new Error(data.message || 'Erreur lors de la génération de la question');
    }
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};

export default function CyberInterviewTest() {
  const [testState, setTestState] = useState<TestState>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes en secondes
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialisation du test
  useEffect(() => {
    if (testState === 'intro') {
      // Réinitialiser les états au démarrage
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setCurrentAnswer('');
      setTimeLeft(15 * 60);
      setEvaluationResult(null);
    } else if (testState === 'in-progress' && questions.length === 0) {
      // Commencer par la question de présentation uniquement
      setQuestions(getInitialQuestion());
    }
  }, [testState]);

  // Gestion du timer
  useEffect(() => {
    if (testState === 'in-progress') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Temps écoulé
            clearInterval(timerRef.current!);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testState]);

  // Formatage du temps restant
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Démarrer le test
  const handleStartTest = () => {
    setTestState('in-progress');
  };

  // Passer à la question suivante ou générer une nouvelle question adaptative
  const handleNextQuestion = async () => {
    // Sauvegarder la réponse actuelle
    if (currentQuestionIndex < questions.length) {
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: currentAnswer
      }));
    }

    // Si c'est la 6ème question (index 5), on termine le test
    if (currentQuestionIndex >= 5) {
      handleSubmitTest();
      return;
    }

    // Si on a déjà une question suivante chargée, on y passe simplement
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer('');
      return;
    }

    // Sinon, on doit générer une nouvelle question adaptative
    try {
      // Construction des précédentes réponses pour l'API
      const presentationAnswer = answers[questions[0].id] || currentAnswer;
      const previousAnswers = questions.map((q, index) => ({
        questionId: q.id,
        type: q.type,
        question: q.question,
        answer: index === currentQuestionIndex ? currentAnswer : answers[q.id] || ''
      }));

      // Obtenir une nouvelle question adaptative
      const nextQuestion = await generateAdaptiveQuestion(
        presentationAnswer,
        currentQuestionIndex,
        previousAnswers
      );

      if (nextQuestion) {
        // Ajouter la nouvelle question à notre liste
        setQuestions(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');
      } else {
        // En cas d'erreur, utiliser une question de secours
        const fallbackQuestion = QUESTIONS.find(q => 
          !questions.some(existingQ => existingQ.type === q.type)
        ) || QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];

        setQuestions(prev => [...prev, fallbackQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentAnswer('');

        toast({
          title: 'Information',
          description: 'Une question générique a été chargée.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération de question:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors du chargement de la question suivante.',
        variant: 'destructive',
      });

      // En cas d'erreur, terminer le test avec les questions actuelles
      if (questions.length > 1) {
        handleSubmitTest();
      }
    }
  };

  // Soumettre le test pour évaluation
  const handleSubmitTest = async () => {
    // Sauvegarder la dernière réponse si pas déjà fait
    if (currentQuestionIndex < questions.length) {
      setAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].id]: currentAnswer
      }));
    }

    setTestState('submitting');
    setIsSubmitting(true);

    try {
      // Préparer les données à envoyer
      const submissionData = {
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question
        })),
        answers: Object.keys(answers).map(qId => ({
          questionId: qId,
          answer: answers[qId]
        }))
      };

      // Appel API pour l'évaluation
      const response = await fetch('/api/cyber/interview-test/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'évaluation du test');
      }

      const data = await response.json();

      if (data.success) {
        setEvaluationResult(data.evaluation);
        setTestState('results');
      } else {
        throw new Error(data.message || 'Erreur lors de l\'évaluation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'évaluation de votre test. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retour à l'accueil
  const handleBackToHome = () => {
    navigate('/cyber');
  };

  // Calculer la progression (6 questions au total)
  const totalQuestions = 6;
  const progress = testState === 'in-progress' 
    ? Math.min(((currentQuestionIndex + 1) / totalQuestions) * 100, 100)
    : 100;

  // Affichage de l'introduction du test
  if (testState === 'intro') {
    return (
      <HomeLayout>
        <div className="container mx-auto py-8 px-4 cyber-interview-test">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-blue-800 dark:text-white">Test d'entretien cybersécurité</CardTitle>
              <CardDescription className="text-center dark:text-white">
                Évaluez vos compétences en cybersécurité avec ce test de 15 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md dark:text-white">
                <h3 className="font-semibold mb-2 flex items-center text-blue-800 dark:text-white">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Comment ça fonctionne
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-800 dark:text-gray-200">
                  <li>Test chronométré de 15 minutes</li>
                  <li>6 questions ouvertes sur différents aspects de la cybersécurité</li>
                  <li>Répondez à chaque question de façon concise mais complète</li>
                  <li>À la fin, une IA analysera vos réponses et générera un profil d'évaluation</li>
                  <li>Vous recevrez une analyse de vos forces et axes d'amélioration</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md dark:text-white">
                <h3 className="font-semibold mb-2 flex items-center text-blue-800 dark:text-white">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                  À savoir avant de commencer
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-800 dark:text-gray-200">
                  <li>Le test sera chronométré dès que vous cliquerez sur "Commencer"</li>
                  <li>Vous ne pourrez pas revenir à une question précédente</li>
                  <li>Si le temps s'écoule, vos réponses seront automatiquement soumises</li>
                  <li>Assurez-vous d'être dans un environnement calme et sans distractions</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                onClick={handleBackToHome} 
                variant="outline"
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à I AM CYBER
              </Button>
              <Button 
                size="lg" 
                onClick={handleStartTest}
                className="md:w-auto"
              >
                Commencer le test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </HomeLayout>
    );
  }

  // Affichage des résultats
  if (testState === 'results' && evaluationResult) {
    return (
      <HomeLayout>
        <div className="container mx-auto py-8 px-4 cyber-interview-test">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-800 dark:text-white">Évaluation terminée</CardTitle>
              <CardDescription className="dark:text-white">
                Analyse de votre profil en cybersécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md dark:text-white">
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-white">🧑‍💼 Profil évalué</h3>
                <p className="text-sm text-gray-800 dark:text-white">{evaluationResult.profile}</p>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md dark:text-white">
                <h3 className="font-semibold mb-2 flex items-center text-blue-800 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                  Forces
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-800 dark:text-white">
                  {evaluationResult.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md dark:text-white">
                <h3 className="font-semibold mb-2 flex items-center text-blue-800 dark:text-white">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                  Axes de progression
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-800 dark:text-white">
                  {evaluationResult.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-md dark:text-white">
                <h3 className="font-semibold mb-2 text-blue-800 dark:text-white">🎖️ Badge attribué</h3>
                <Badge className="mb-2 bg-purple-600">{evaluationResult.badge.name}</Badge>
                <p className="text-sm text-gray-800 dark:text-white">{evaluationResult.badge.justification}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={handleBackToHome} 
                className="w-full md:w-auto gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à I AM CYBER
              </Button>
            </CardFooter>
          </Card>
        </div>
      </HomeLayout>
    );
  }

  // Affichage de la soumission en cours
  if (testState === 'submitting') {
    return (
      <HomeLayout>
        <div className="container mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[50vh] cyber-interview-test">
          <div className="w-16 h-16 border-4 border-t-transparent border-blue-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 text-blue-800 dark:text-white">Analyse en cours...</h2>
          <p className="dark:text-white text-center max-w-md">
            Notre IA analyse vos réponses pour générer votre profil de compétences en cybersécurité.
            Cela peut prendre quelques instants.
          </p>
        </div>
      </HomeLayout>
    );
  }

  // Affichage du test en cours
  return (
    <HomeLayout>
      <div className="container mx-auto py-8 px-4 cyber-interview-test">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-blue-800 dark:text-white">
                  Question {currentQuestionIndex + 1}/{totalQuestions}
                </CardTitle>
                <CardDescription className="dark:text-white">
                  {questions[currentQuestionIndex]?.type === 'presentation' ? 'Présentation' : 
                   questions[currentQuestionIndex]?.type === 'reflex' ? 'Réflexes de sécurité' : 
                   questions[currentQuestionIndex]?.type === 'incident' ? 'Gestion d\'incident' : 
                   questions[currentQuestionIndex]?.type === 'analysis' ? 'Analyse technique' : 
                   questions[currentQuestionIndex]?.type === 'ethical' ? 'Éthique professionnelle' : 
                   questions[currentQuestionIndex]?.type === 'client' ? 'Relation client' : 
                   'Prospective'}
                </CardDescription>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-md dark:text-white">
                <Clock className="h-5 w-5 mr-2 text-amber-600" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium">{questions[currentQuestionIndex]?.question}</h3>
              {questions[currentQuestionIndex]?.hint && (
                <p className="text-sm">{questions[currentQuestionIndex]?.hint}</p>
              )}
            </div>
            <Textarea
              placeholder={questions[currentQuestionIndex]?.placeholder}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="min-h-[150px] text-gray-800 dark:text-white"
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              onClick={handleBackToHome} 
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à I AM CYBER
            </Button>
            <Button 
              onClick={handleNextQuestion}
              disabled={currentAnswer.trim().length < 3}
            >
              {currentQuestionIndex < totalQuestions - 1 ? 'Question suivante' : 'Terminer le test'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </HomeLayout>
  );
}