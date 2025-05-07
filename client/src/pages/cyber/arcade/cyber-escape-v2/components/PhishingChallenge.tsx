import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlarmClock, AlertCircle, ArrowRight, CheckCircle, Mail, ShieldAlert, ThumbsDown, ThumbsUp, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface PhishingChallengeProps {
  onComplete: (success: boolean, score: number, timeBonus: number) => void;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface Email {
  id: string;
  sender: string;
  subject: string;
  content: string;
  isPhishing: boolean;
  hints?: string[];
}

/**
 * Mini-jeu de détection des emails de phishing
 */
const PhishingChallenge: React.FC<PhishingChallengeProps> = ({ onComplete, difficultyLevel }) => {
  // États du jeu
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes par défaut
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Charger les emails au démarrage (dans un vrai jeu, ils viendraient de l'API)
  useEffect(() => {
    // Simuler le chargement des emails
    const dummyEmails: Email[] = [
      {
        id: 'email1',
        sender: 'service-client@bankofamerica.com',
        subject: 'Action urgente requise sur votre compte',
        content: 'Cher client, Nous avons détecté une activité inhabituelle sur votre compte. Veuillez cliquer sur le lien ci-dessous pour vérifier votre identité et sécuriser votre compte: https://bank0famerica-secure.com/verify',
        isPhishing: true,
        hints: ['Vérifiez l\'URL attentivement', 'Les banques légitimes n\'utilisent pas de domaines avec des chiffres au lieu de lettres']
      },
      {
        id: 'email2',
        sender: 'rh@entreprise-interne.com',
        subject: 'Mise à jour de la politique de sécurité',
        content: 'Chers collègues, Veuillez prendre connaissance de la nouvelle politique de sécurité de l\'entreprise en pièce jointe. Merci de confirmer que vous l\'avez lue avant vendredi. Cordialement, Le service RH',
        isPhishing: false,
        hints: ['L\'adresse email de l\'expéditeur correspond au domaine de l\'entreprise', 'Le message ne demande pas d\'informations sensibles']
      },
      {
        id: 'email3',
        sender: 'amazon-orders@amazonshopping.net',
        subject: 'Confirmation de commande #A38259B',
        content: 'Votre commande d\'un téléphone Samsung Galaxy S23 Ultra (1899€) a été traitée. Si vous n\'avez pas passé cette commande, veuillez cliquer ici pour l\'annuler et vérifier votre compte: https://amaz0n-verify.net/cancel',
        isPhishing: true,
        hints: ['Amazon utilise uniquement ses domaines officiels', 'Les liens suspects avec des domaines similaires sont souvent des signes de phishing']
      },
      {
        id: 'email4',
        sender: 'contact@microsoft.com',
        subject: 'Renouvellement de votre licence Microsoft 365',
        content: 'Votre abonnement Microsoft 365 sera bientôt renouvelé. Consultez les détails sur votre compte Microsoft en vous connectant sur https://account.microsoft.com',
        isPhishing: false,
        hints: ['L\'URL pointe vers le domaine officiel de Microsoft', 'Pas d\'urgence ou de menace dans le message']
      },
    ];
    
    setEmails(dummyEmails);
  }, []);
  
  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);
  
  // Email actuel
  const currentEmail = emails[currentEmailIndex];
  
  // Gérer la réponse de l'utilisateur
  const handleAnswer = (isPhishing: boolean) => {
    if (!currentEmail || gameOver) return;
    
    const newUserAnswers = {
      ...userAnswers,
      [currentEmail.id]: isPhishing
    };
    
    setUserAnswers(newUserAnswers);
    
    // Calculer si la réponse est correcte
    const isCorrect = isPhishing === currentEmail.isPhishing;
    
    // Mettre à jour le score
    if (isCorrect) {
      setScore(prev => prev + 25); // 25 points par bonne réponse
    }
    
    // Passer à l'email suivant ou terminer le jeu
    if (currentEmailIndex < emails.length - 1) {
      setTimeout(() => {
        setCurrentEmailIndex(prev => prev + 1);
        setShowHint(false);
      }, 1000);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 1000);
    }
  };
  
  // Terminer le jeu
  const finishGame = () => {
    setGameOver(true);
    
    // Un score de 75 ou plus est considéré comme réussi
    const success = score >= 75;
    
    // Bonus de temps en fonction du score
    const timeBonus = success ? 
      (score === 100 ? 60 : // Score parfait = 60 secondes bonus
       score >= 75 ? 30 : 15) : 0; // Score de passage = 30 secondes, autres scores réussis = 15 secondes
    
    // Informe le parent que le défi est terminé
    onComplete(success, score, timeBonus);
  };
  
  // Formatage du temps
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Rendu du résultat
  const renderResult = () => {
    const correctAnswers = Object.keys(userAnswers).filter(id => {
      const email = emails.find(e => e.id === id);
      return email && userAnswers[id] === email.isPhishing;
    }).length;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Alert 
          className={score >= 75 ? "border-green-500 bg-green-900/20" : "border-red-500 bg-red-900/20"}
        >
          <div className="flex items-center">
            {score >= 75 ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            )}
            <AlertTitle className={score >= 75 ? "text-green-400" : "text-red-400"}>
              {score >= 75 ? "Défi réussi!" : "Défi échoué"}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {score >= 75 
              ? `Beau travail! Vous avez correctement identifié ${correctAnswers} sur ${emails.length} emails.` 
              : `Vous devez obtenir au moins 75 points pour réussir. Vous avez identifié ${correctAnswers} sur ${emails.length} emails.`
            }
          </AlertDescription>
        </Alert>
        
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Score final</h3>
            <Badge 
              className={`text-lg ${score >= 75 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}
            >
              {score}/100
            </Badge>
          </div>
          
          <Progress value={score} className="h-3 mb-4" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-950/50 p-3 rounded-md border border-gray-800">
              <div className="text-sm text-gray-400">Temps restant</div>
              <div className="text-xl font-mono text-blue-400 mt-1">{formatTime(timeLeft)}</div>
            </div>
            
            <div className="bg-gray-950/50 p-3 rounded-md border border-gray-800">
              <div className="text-sm text-gray-400">Bonus de temps</div>
              <div className="text-xl font-mono text-green-400 mt-1">
                +{score === 100 ? '60' : score >= 75 ? '30' : '0'}s
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={finishGame}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Continuer <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  };
  
  if (!currentEmail) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Chargement du défi...</p>
      </div>
    );
  }
  
  return (
    <Card className="border-blue-800 bg-gray-900/70 shadow-xl">
      <CardHeader className="border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-blue-400">Détection de Phishing</CardTitle>
            <CardDescription>Analysez les emails et identifiez ceux qui sont malveillants</CardDescription>
          </div>
          
          <div className="flex items-center bg-gray-950 px-3 py-2 rounded-md border border-gray-800">
            <AlarmClock className="h-4 w-4 text-yellow-500 mr-2" />
            <span className={`font-mono ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-6">
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderResult()}
            </motion.div>
          ) : (
            <motion.div
              key={currentEmail.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-blue-700 bg-blue-900/30 text-blue-300">
                  Email {currentEmailIndex + 1} / {emails.length}
                </Badge>
                
                <div className="text-sm text-gray-400">
                  Score actuel: <span className="text-blue-400 font-medium">{score}</span>
                </div>
              </div>
              
              <Card className="border border-gray-700 bg-white/95 text-gray-800">
                <CardHeader className="bg-gray-100 border-b border-gray-300 pb-3">
                  <div className="flex items-center mb-2">
                    <Mail className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-900">{currentEmail.sender}</span>
                  </div>
                  <CardTitle className="text-lg text-gray-900">{currentEmail.subject}</CardTitle>
                </CardHeader>
                
                <CardContent className="py-4">
                  <div className="whitespace-pre-line text-gray-700">
                    {currentEmail.content}
                  </div>
                </CardContent>
              </Card>
              
              {userAnswers[currentEmail.id] !== undefined ? (
                <Alert 
                  className={userAnswers[currentEmail.id] === currentEmail.isPhishing 
                    ? "border-green-500 bg-green-900/20" 
                    : "border-red-500 bg-red-900/20"}
                >
                  <div className="flex items-center">
                    {userAnswers[currentEmail.id] === currentEmail.isPhishing ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={userAnswers[currentEmail.id] === currentEmail.isPhishing 
                      ? "text-green-400" 
                      : "text-red-400"}
                    >
                      {userAnswers[currentEmail.id] === currentEmail.isPhishing 
                        ? "Correct!" 
                        : "Incorrect!"}
                    </span>
                  </div>
                  <div className="mt-2">
                    {currentEmail.isPhishing 
                      ? "Cet email est une tentative de phishing. Soyez vigilant face aux signes comme les URL suspectes, les demandes urgentes ou les fautes d'orthographe." 
                      : "Cet email est légitime. Il ne présente pas les signes typiques d'une tentative de phishing."}
                  </div>
                </Alert>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-red-800 bg-red-900/30 hover:bg-red-800/50 py-6"
                    onClick={() => handleAnswer(true)}
                  >
                    <ShieldAlert className="h-6 w-6 text-red-400 mr-2" />
                    <span className="text-lg font-medium text-red-300">Phishing</span>
                  </Button>
                  
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-green-800 bg-green-900/30 hover:bg-green-800/50 py-6"
                    onClick={() => handleAnswer(false)}
                  >
                    <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                    <span className="text-lg font-medium text-green-300">Légitime</span>
                  </Button>
                </div>
              )}
              
              {currentEmail.hints && (
                <div>
                  {showHint ? (
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <h3 className="text-sm font-medium text-yellow-300 mb-2">Indices</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {currentEmail.hints.map((hint, index) => (
                          <li key={index} className="text-sm text-gray-300">{hint}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost"
                      className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                      onClick={() => setShowHint(true)}
                    >
                      Afficher les indices
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default PhishingChallenge;