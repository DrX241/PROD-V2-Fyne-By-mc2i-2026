import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    level: 'débutant' | 'confirmé' | 'senior' | 'expert';
  }[];
}

interface LevelAssessmentProps {
  domain: string;
  onComplete: (level: string) => void;
}

export function LevelAssessment({ domain, onComplete }: LevelAssessmentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Récupération des questions adaptées au domaine
  const { data: questions, isLoading } = useQuery({
    queryKey: ['/api/cyber/assessment/questions', domain],
    queryFn: async () => {
      const response = await fetch(`/api/cyber/assessment/questions?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des questions');
      }
      return response.json() as Promise<{ questions: Question[] }>;
    },
  });

  const currentQuestion = questions?.questions[currentQuestionIndex];

  // Gestionnaire pour passer à la question suivante
  const handleNextQuestion = () => {
    if (!selectedOption || !currentQuestion) return;

    // Enregistrer la réponse
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    // Réinitialiser la sélection
    setSelectedOption(null);

    // Passer à la question suivante ou terminer l'évaluation
    if (currentQuestionIndex < (questions?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculer le niveau final
      calculateLevel();
    }
  };

  // Calcul du niveau basé sur les réponses
  const calculateLevel = async () => {
    try {
      const response = await fetch('/api/cyber/assessment/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          answers,
          questions: questions?.questions
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'évaluation');
      }

      const data = await response.json();
      setResult(data.level);
      setIsCompleted(true);
      
      // Notifier le composant parent
      setTimeout(() => {
        onComplete(data.level);
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'évaluation:', error);
      // En cas d'échec, utiliser un niveau par défaut
      setResult('débutant');
      setIsCompleted(true);
      setTimeout(() => {
        onComplete('débutant');
      }, 2000);
    }
  };

  // Fonction pour simuler les questions durant le développement
  useEffect(() => {
    if (isLoading && !questions) {
      // Données de test si l'API n'est pas encore implémentée
      console.log('Utilisation de données de test pour les questions');
    }
  }, [isLoading, questions]);

  if (isLoading) {
    return (
      <Card className="p-6 shadow-md bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement des questions...</p>
        </div>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="p-6 shadow-md bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center py-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Évaluation terminée</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Votre niveau en cybersécurité a été évalué : <span className="font-bold">{result}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Préparation de votre conversation avec le PNJ...
          </p>
        </div>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="p-6 shadow-md bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-gray-600 dark:text-gray-300">Aucune question disponible pour ce domaine.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-md bg-white dark:bg-gray-800">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Question {currentQuestionIndex + 1}/{questions?.questions.length || 0}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Domaine: {domain}
          </span>
        </div>
        <p className="text-gray-800 dark:text-gray-200 font-medium mb-4">
          {currentQuestion.text}
        </p>
      </div>

      <RadioGroup
        value={selectedOption || ''}
        onValueChange={setSelectedOption}
        className="space-y-3 mb-6"
      >
        {currentQuestion.options.map((option) => (
          <div 
            key={option.id}
            className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <RadioGroupItem value={option.id} id={option.id} />
            <Label htmlFor={option.id} className="flex-1 cursor-pointer">
              {option.text}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-end">
        <Button
          onClick={handleNextQuestion}
          disabled={!selectedOption}
          className="px-6"
        >
          {currentQuestionIndex < (questions?.questions.length || 0) - 1 ? 'Suivant' : 'Terminer'}
        </Button>
      </div>
    </Card>
  );
}