import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Circle, ChevronRight, ArrowRight, Loader2 } from 'lucide-react';

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
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({
    débutant: 0,
    confirmé: 0,
    senior: 0,
    expert: 0
  });

  // Récupérer les questions d'évaluation pour le domaine spécifié
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cyber/assessment/questions?domain=${encodeURIComponent(domain)}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des questions');
        }
        
        const data = await response.json();
        
        // S'assurer de n'avoir pas plus de 5 questions
        const limitedQuestions = data.questions.slice(0, 5);
        setQuestions(limitedQuestions);
      } catch (error) {
        console.error('Erreur:', error);
        // En cas d'erreur, utiliser des questions locales de secours
        setQuestions(getFallbackQuestions(domain));
        toast({
          title: "Mode hors ligne",
          description: "Utilisation de questions locales pour l'évaluation",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, [domain, toast]);

  // Gère le changement de réponse pour la question actuelle
  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  // Passe à la question suivante ou termine l'évaluation
  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitAssessment();
    }
  };

  // Calcule le niveau d'expertise basé sur les réponses
  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Compter les niveaux des réponses choisies
      const counts = { débutant: 0, confirmé: 0, senior: 0, expert: 0 };
      
      Object.entries(answers).forEach(([questionId, selectedOptionId]) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          if (selectedOption) {
            counts[selectedOption.level] += 1;
          }
        }
      });
      
      setLevelCounts(counts);
      
      // Déterminer le niveau dominant
      const levels = ['débutant', 'confirmé', 'senior', 'expert'];
      let dominantLevel = 'débutant'; // Niveau par défaut
      let maxCount = 0;
      
      levels.forEach(level => {
        if (counts[level as keyof typeof counts] > maxCount) {
          maxCount = counts[level as keyof typeof counts];
          dominantLevel = level;
        }
      });
      
      // Appeler l'API pour enregistrer les résultats
      await fetch('/api/cyber/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain,
          answers,
          result: dominantLevel
        }),
      });
      
      // Notifier le composant parent
      onComplete(dominantLevel);
      
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'évaluation:', error);
      // En cas d'erreur, déterminer le niveau localement
      const counts = { débutant: 0, confirmé: 0, senior: 0, expert: 0 };
      
      Object.entries(answers).forEach(([questionId, selectedOptionId]) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
          const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
          if (selectedOption) {
            counts[selectedOption.level] += 1;
          }
        }
      });
      
      const levels = ['débutant', 'confirmé', 'senior', 'expert'];
      let dominantLevel = 'débutant';
      let maxCount = 0;
      
      levels.forEach(level => {
        if (counts[level as keyof typeof counts] > maxCount) {
          maxCount = counts[level as keyof typeof counts];
          dominantLevel = level;
        }
      });
      
      onComplete(dominantLevel);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Questions de secours pour chaque domaine en cas d'erreur de connexion API
  const getFallbackQuestions = (domain: string): Question[] => {
    switch (domain) {
      case "Ingénierie sociale et phishing":
        return [
          {
            id: "phishing1",
            text: "Comment identifiez-vous un email de phishing ?",
            options: [
              { id: "p1", text: "Je vérifie l'adresse email de l'expéditeur", level: 'débutant' },
              { id: "p2", text: "Je recherche les fautes d'orthographe et examine l'URL au survol des liens", level: 'confirmé' },
              { id: "p3", text: "J'analyse les en-têtes DKIM et SPF pour vérifier l'authenticité", level: 'senior' },
              { id: "p4", text: "J'utilise des outils d'analyse forensique pour examiner la structure complète et les métadonnées", level: 'expert' }
            ]
          },
          {
            id: "phishing2",
            text: "Comment réagiriez-vous face à une attaque de spear phishing ciblant un dirigeant ?",
            options: [
              { id: "sp1", text: "Je signale l'email au support informatique", level: 'débutant' },
              { id: "sp2", text: "Je mets en place une formation de sensibilisation pour les dirigeants", level: 'confirmé' },
              { id: "sp3", text: "J'implémenterais un protocole de vérification des demandes sensibles avec authentification multi-facteurs", level: 'senior' },
              { id: "sp4", text: "Je développerais une stratégie de défense avancée avec isolation des segments réseau et simulations régulières d'attaques ciblées", level: 'expert' }
            ]
          }
        ];
      
      case "Stratégie et gouvernance cybersécurité":
        return [
          {
            id: "gov1",
            text: "Comment décririez-vous une politique de cybersécurité efficace ?",
            options: [
              { id: "g1", text: "Un document qui liste les règles à suivre", level: 'débutant' },
              { id: "g2", text: "Un ensemble de procédures détaillées alignées avec les standards de l'industrie", level: 'confirmé' },
              { id: "g3", text: "Un cadre stratégique aligné sur les objectifs métier avec des contrôles basés sur les risques", level: 'senior' },
              { id: "g4", text: "Un système holistique intégrant la culture, les processus et la technologie avec une gouvernance adaptative et une conformité continue", level: 'expert' }
            ]
          },
          {
            id: "gov2",
            text: "Comment mesureriez-vous l'efficacité d'un programme de sécurité ?",
            options: [
              { id: "gm1", text: "Par le nombre d'incidents détectés", level: 'débutant' },
              { id: "gm2", text: "Par des audits réguliers et des tests de pénétration", level: 'confirmé' },
              { id: "gm3", text: "Par des KPIs stratégiques alignés sur la réduction des risques et la résilience opérationnelle", level: 'senior' },
              { id: "gm4", text: "Par une matrice d'efficacité multidimensionnelle évaluant la maturité, le ROI de sécurité et la résilience adaptative face aux menaces émergentes", level: 'expert' }
            ]
          }
        ];
      
      case "Gestion de crise cyber":
        return [
          {
            id: "crisis1",
            text: "Quelle est la première action à entreprendre lors d'une cyberattaque ?",
            options: [
              { id: "c1", text: "Contacter immédiatement la police", level: 'débutant' },
              { id: "c2", text: "Isoler les systèmes affectés et activer la cellule de crise", level: 'confirmé' },
              { id: "c3", text: "Évaluer rapidement l'ampleur et classifier l'incident avant de déployer une réponse calibrée selon des playbooks prédéfinis", level: 'senior' },
              { id: "c4", text: "Mobiliser la war room virtuelle avec activation simultanée des protocoles de collection de preuves forensiques, de containment adaptatif et d'analyse des TTPs", level: 'expert' }
            ]
          },
          {
            id: "crisis2",
            text: "Comment préparez-vous votre organisation à gérer un ransomware ?",
            options: [
              { id: "r1", text: "En faisant des sauvegardes régulières", level: 'débutant' },
              { id: "r2", text: "En développant un plan d'intervention spécifique et en formant les équipes", level: 'confirmé' },
              { id: "r3", text: "En implémentant une stratégie de défense en profondeur avec segmentation réseau et en organisant des exercices de simulation réalistes", level: 'senior' },
              { id: "r4", text: "En orchestrant un programme complet d'anticipation incluant threat intelligence proactive, déception technology, cyber-assurance, et coordination avec les autorités nationales", level: 'expert' }
            ]
          }
        ];
      
      // Questions par défaut si le domaine n'est pas reconnu
      default:
        return [
          {
            id: "default1",
            text: "Comment évaluez-vous votre niveau en cybersécurité ?",
            options: [
              { id: "d1", text: "Je connais les bases et les bonnes pratiques", level: 'débutant' },
              { id: "d2", text: "Je maîtrise les concepts intermédiaires et peux implémenter des solutions standards", level: 'confirmé' },
              { id: "d3", text: "Je possède une expertise avancée et peux concevoir des architectures sécurisées", level: 'senior' },
              { id: "d4", text: "Je suis expert et capable de résoudre des problèmes complexes avec une vision stratégique", level: 'expert' }
            ]
          },
          {
            id: "default2",
            text: "Quelle approche privilégiez-vous face à un nouveau défi de sécurité ?",
            options: [
              { id: "a1", text: "Je cherche des solutions éprouvées et documentées", level: 'débutant' },
              { id: "a2", text: "J'analyse la situation et applique les meilleures pratiques adaptées", level: 'confirmé' },
              { id: "a3", text: "Je combine plusieurs méthodologies et développe une approche systémique", level: 'senior' },
              { id: "a4", text: "Je crée un cadre d'analyse innovant et développe une stratégie sur mesure basée sur l'analyse des risques", level: 'expert' }
            ]
          }
        ];
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCurrentQuestionAnswered = currentQuestion ? !!answers[currentQuestion.id] : false;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="text-blue-200 text-center">Chargement des questions d'évaluation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-2">
      {/* Barre de progression */}
      <div className="w-full bg-blue-900/40 rounded-full h-2.5 my-4">
        <div 
          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        ></div>
        <p className="text-sm text-blue-300 text-right mt-1">
          Question {currentQuestionIndex + 1}/{questions.length}
        </p>
      </div>

      {currentQuestion && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-lg font-medium text-white/90">{currentQuestion.text}</h3>
          
          <RadioGroup 
            value={answers[currentQuestion.id] || ""} 
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div 
                key={option.id}
                className={`flex items-start p-3 rounded-lg border bg-white/5 transition-all duration-300 hover:bg-white/10 ${
                  answers[currentQuestion.id] === option.id 
                    ? 'border-blue-500 shadow-md shadow-blue-900/30' 
                    : 'border-blue-800/30'
                }`}
              >
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id} 
                  className="sr-only"
                />
                <div className="flex-shrink-0 mt-0.5 mr-3">
                  {answers[currentQuestion.id] === option.id ? (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-blue-300/50" />
                  )}
                </div>
                <Label 
                  htmlFor={option.id} 
                  className={`flex-1 text-sm cursor-pointer ${
                    answers[currentQuestion.id] === option.id 
                      ? 'text-white' 
                      : 'text-blue-100/80'
                  }`}
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleNextQuestion}
              disabled={!isCurrentQuestionAnswered}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 flex items-center gap-2"
            >
              {currentQuestionIndex + 1 < questions.length ? (
                <>
                  <span>Question suivante</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Analyse en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Terminer l'évaluation</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}