import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, HelpCircle, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import axios from 'axios';

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Expert';
}

interface EducationalContentProps {
  title: string;
  description: string;
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
  domain: string;
  onComplete?: () => void;
}

export default function EducationalContent({
  title,
  description,
  contactName,
  contactRole,
  contactAvatar,
  badgeId,
  badgeName,
  badgeIcon,
  domain,
  onComplete
}: EducationalContentProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'questions' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<{questionId: string, selectedId: string, correct: boolean}[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Utiliser l'API pour générer des questions pour ce domaine
      const response = await axios.post('/api/cyber/generate-questions', {
        domain: domain,
        count: 4 // Nombre de questions à générer
      });
      
      if (response.data && response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
      } else {
        // Utiliser des questions par défaut si l'API échoue
        setQuestions([
          {
            id: '1',
            text: 'Quelle est la meilleure pratique pour créer un mot de passe sécurisé ?',
            options: [
              { id: 'a', text: 'Utiliser votre date de naissance' },
              { id: 'b', text: 'Créer une phrase secrète longue avec des caractères spéciaux' },
              { id: 'c', text: 'Utiliser le même mot de passe pour tous vos comptes' },
              { id: 'd', text: 'Écrire votre mot de passe sur un post-it' }
            ],
            correctOptionId: 'b',
            explanation: 'Une phrase secrète longue avec des caractères spéciaux est plus difficile à deviner par les attaquants. Les mots de passe basés sur des informations personnelles ou réutilisés sont plus vulnérables.',
            difficulty: 'Débutant'
          },
          {
            id: '2',
            text: 'Qu\'est-ce qu\'une attaque par hameçonnage (phishing) ?',
            options: [
              { id: 'a', text: 'Une attaque qui surcharge un serveur avec des requêtes' },
              { id: 'b', text: 'Une technique pour deviner les mots de passe' },
              { id: 'c', text: 'Une tentative de tromper les utilisateurs pour qu\'ils divulguent des informations sensibles' },
              { id: 'd', text: 'Un logiciel qui chiffre vos données et demande une rançon' }
            ],
            correctOptionId: 'c',
            explanation: 'Le phishing est une technique d\'ingénierie sociale où les attaquants se font passer pour des entités légitimes pour inciter les victimes à révéler des informations confidentielles comme des mots de passe ou des numéros de carte de crédit.',
            difficulty: 'Débutant'
          },
          {
            id: '3',
            text: 'Qu\'est-ce qu\'un pare-feu (firewall) ?',
            options: [
              { id: 'a', text: 'Un antivirus avancé' },
              { id: 'b', text: 'Un système qui surveille et contrôle le trafic réseau entrant et sortant' },
              { id: 'c', text: 'Un programme qui chiffre vos fichiers' },
              { id: 'd', text: 'Un système de détection d\'intrusion physique' }
            ],
            correctOptionId: 'b',
            explanation: 'Un pare-feu est un dispositif de sécurité réseau qui surveille et filtre le trafic réseau entrant et sortant en fonction de règles de sécurité prédéfinies. Il sert de barrière entre un réseau sécurisé et un réseau non fiable comme Internet.',
            difficulty: 'Débutant'
          },
          {
            id: '4',
            text: 'Quelle est la définition d\'une vulnérabilité zero-day ?',
            options: [
              { id: 'a', text: 'Une faille découverte le jour même de sa correction' },
              { id: 'b', text: 'Une vulnérabilité qui n\'a jamais été exploitée' },
              { id: 'c', text: 'Une faille de sécurité inconnue du développeur et sans correctif disponible' },
              { id: 'd', text: 'Un virus qui se propage très rapidement' }
            ],
            correctOptionId: 'c',
            explanation: 'Une vulnérabilité zero-day (ou 0-day) est une faille de sécurité informatique qui n\'a pas encore été publiée ou corrigée par le développeur du logiciel. Cela signifie que les attaquants peuvent l\'exploiter avant que quiconque n\'ait l\'opportunité de développer un correctif.',
            difficulty: 'Intermédiaire'
          }
        ]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      // Utiliser les questions par défaut en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const startQuestions = () => {
    fetchQuestions();
    setCurrentStep('questions');
  };

  const handleOptionSelect = (optionId: string) => {
    if (!hasAnswered) {
      setSelectedOption(optionId);
    }
  };

  const submitAnswer = () => {
    if (!selectedOption || !questions[currentQuestionIndex]) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctOptionId;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAnswers(prev => [
      ...prev, 
      {
        questionId: currentQuestion.id,
        selectedId: selectedOption,
        correct: isCorrect
      }
    ]);
    
    setHasAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      // Toutes les questions ont été répondues
      const earnedBadge = score >= Math.ceil(questions.length * 0.75); // 75% de bonnes réponses pour gagner le badge
      setBadgeEarned(earnedBadge);
      setCurrentStep('results');
    }
  };

  const renderIntro = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
          <AvatarDisplay avatarId={contactAvatar} size="lg" />
          <div>
            <h3 className="font-semibold">{contactName}</h3>
            <p className="text-sm text-muted-foreground">{contactRole}</p>
            <p className="text-sm mt-2">
              "Je vais vous guider à travers ce parcours d'apprentissage et tester vos connaissances avec quelques questions. Êtes-vous prêt(e) à commencer ?"
            </p>
          </div>
        </div>

        {badgeId && (
          <div className="mt-6 p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <h3 className="font-semibold">Badge à gagner</h3>
            </div>
            <p className="text-sm mb-2">
              Complétez ce module avec succès pour gagner le badge <strong>{badgeName || badgeId}</strong>.
            </p>
            <p className="text-xs text-muted-foreground">
              Vous devez répondre correctement à au moins 75% des questions.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={startQuestions}>Commencer le parcours</Button>
      </CardFooter>
    </Card>
  );

  const renderQuestion = () => {
    if (loading) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Chargement des questions...</p>
          </CardContent>
        </Card>
      );
    }
    
    if (!questions.length) {
      return (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg">Impossible de charger les questions. Veuillez réessayer.</p>
            <Button onClick={() => setCurrentStep('intro')} className="mt-4">Retour</Button>
          </CardContent>
        </Card>
      );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline">Question {currentQuestionIndex + 1}/{questions.length}</Badge>
            <Badge variant={
              currentQuestion.difficulty === 'Débutant' ? 'default' : 
              currentQuestion.difficulty === 'Intermédiaire' ? 'secondary' : 
              'destructive'
            }>
              {currentQuestion.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption || ""} className="space-y-3">
            {currentQuestion.options.map(option => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 border rounded-lg p-3 transition-colors ${
                  hasAnswered
                    ? option.id === currentQuestion.correctOptionId
                      ? 'border-green-500 bg-green-50'
                      : selectedOption === option.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-transparent'
                    : selectedOption === option.id
                    ? 'border-primary'
                    : 'hover:border-muted-foreground cursor-pointer'
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`option-${option.id}`}
                  disabled={hasAnswered}
                  className="data-[state=checked]:text-primary"
                />
                <Label
                  htmlFor={`option-${option.id}`}
                  className="w-full cursor-pointer font-normal"
                >
                  {option.text}
                </Label>
                {hasAnswered && (
                  option.id === currentQuestion.correctOptionId ? (
                    <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                  ) : selectedOption === option.id ? (
                    <XCircle className="h-5 w-5 text-red-500 ml-auto" />
                  ) : null
                )}
              </div>
            ))}
          </RadioGroup>

          {hasAnswered && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Explication</h4>
                  <p className="text-sm">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm">
            Score actuel: {score}/{answers.length} correctes
          </div>
          <div>
            {!hasAnswered ? (
              <Button 
                onClick={submitAnswer} 
                disabled={!selectedOption}
              >
                Valider
              </Button>
            ) : (
              <Button onClick={nextQuestion}>
                {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const renderResults = () => (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Résultats</CardTitle>
        <CardDescription>
          Vous avez obtenu {score} bonnes réponses sur {questions.length} questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badgeEarned && badgeId ? (
          <div className="mb-6 p-6 border border-amber-200 bg-amber-50 rounded-lg text-center">
            <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Félicitations !</h3>
            <p className="mb-4">Vous avez gagné le badge <strong>{badgeName || badgeId}</strong> !</p>
            <Badge className="mx-auto" variant="outline">
              <span className="mr-1">{badgeIcon || "🏆"}</span> {badgeName || badgeId}
            </Badge>
          </div>
        ) : badgeId ? (
          <div className="mb-6 p-6 border rounded-lg text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Presque !</h3>
            <p className="text-sm">
              Vous avez besoin d'au moins {Math.ceil(questions.length * 0.75)} bonnes réponses pour gagner le badge.
              <br />Vous pouvez réessayer pour améliorer votre score.
            </p>
          </div>
        ) : null}

        <div className="space-y-4">
          <h3 className="font-semibold">Détail des réponses :</h3>
          {questions.map((question, index) => {
            const answer = answers.find(a => a.questionId === question.id);
            return (
              <div key={question.id} className="p-3 border rounded-lg">
                <div className="flex items-start gap-2">
                  {answer?.correct ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{index + 1}. {question.text}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Réponse correcte: {question.options.find(o => o.id === question.correctOptionId)?.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => {
          setCurrentStep('intro');
          setCurrentQuestionIndex(0);
          setSelectedOption(null);
          setHasAnswered(false);
          setScore(0);
          setAnswers([]);
          setBadgeEarned(false);
        }}>
          Réessayer
        </Button>
        <Button onClick={onComplete}>Terminer</Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      {currentStep === 'intro' && renderIntro()}
      {currentStep === 'questions' && renderQuestion()}
      {currentStep === 'results' && renderResults()}
    </div>
  );
}