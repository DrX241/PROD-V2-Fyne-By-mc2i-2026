import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Shield, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface Email {
  id: string;
  sender: string;
  subject: string;
  content: string;
  isPhishing: boolean;
  hints?: string[];
}

interface PhishingChallengeProps {
  onComplete: (success: boolean, score: number, timeBonus: number) => void;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Mini-jeu de détection de phishing
 */
const PhishingChallenge: React.FC<PhishingChallengeProps> = ({
  onComplete,
  difficultyLevel
}) => {
  // Emails factices pour le challenge
  const [emails, setEmails] = useState<Email[]>([
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
    }
  ]);
  
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes en secondes
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [hintUsed, setHintUsed] = useState<Record<string, boolean>>({});
  
  // Démarrer le timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Formater le temps au format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculer le score
  const calculateScore = () => {
    let correctAnswers = 0;
    let totalEmails = emails.length;
    
    emails.forEach(email => {
      if (userAnswers[email.id] === email.isPhishing) {
        correctAnswers++;
      }
    });
    
    // Calculer le score sur 100
    const score = Math.round((correctAnswers / totalEmails) * 100);
    
    // Calculer le bonus de temps (plus de temps restant = plus de bonus)
    const timeBonus = Math.round(timeLeft / 4);
    
    return { score, correctAnswers, totalEmails, timeBonus };
  };
  
  // Vérifier si le challenge est complet
  const isComplete = () => {
    return emails.every(email => userAnswers[email.id] !== undefined);
  };
  
  // Finaliser le challenge
  const completeChallenge = () => {
    const { score, timeBonus } = calculateScore();
    const success = score >= 75; // 75% de réussite minimum
    
    // Attendre un peu pour afficher le feedback avant de compléter
    setTimeout(() => {
      onComplete(success, score, timeBonus);
    }, 2000);
    
    setShowFeedback(true);
  };
  
  // Répondre à un email
  const handleAnswer = (emailId: string, isPhishing: boolean) => {
    setUserAnswers(prev => ({
      ...prev,
      [emailId]: isPhishing
    }));
    
    // Si c'est le dernier email, compléter le challenge
    if (Object.keys(userAnswers).length + 1 === emails.length) {
      completeChallenge();
    }
  };
  
  // Utiliser un indice
  const useHint = (emailId: string) => {
    setHintUsed(prev => ({
      ...prev,
      [emailId]: true
    }));
  };
  
  return (
    <Card className="bg-gray-900 border-blue-900 shadow-lg shadow-blue-900/10">
      <CardHeader className="border-b border-blue-900/50 bg-blue-950/30">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-lg text-blue-300">Détection de Phishing</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-mono text-yellow-400">
              {formatTime(timeLeft)}
            </span>
            <Progress value={(timeLeft / 120) * 100} className="w-24 h-2" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3">
        {/* Liste des emails */}
        <div className="col-span-1 border-r border-gray-800">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Boîte de réception</h3>
            <div className="space-y-2">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  className={`
                    p-3 border rounded-md cursor-pointer transition-all
                    ${selectedEmail?.id === email.id 
                      ? 'bg-blue-950/30 border-blue-700' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'}
                    ${userAnswers[email.id] !== undefined ? 'opacity-60' : ''}
                  `}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm truncate">{email.sender}</div>
                    {userAnswers[email.id] !== undefined && (
                      userAnswers[email.id] === email.isPhishing 
                        ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                        : <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="text-sm text-gray-400 truncate">{email.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Contenu de l'email */}
        <div className="col-span-2 p-4">
          {selectedEmail ? (
            <div>
              <div className="bg-gray-800 rounded-t-md p-3 border border-gray-700">
                <div className="grid grid-cols-12 gap-2 text-sm">
                  <div className="col-span-2 text-gray-400">De:</div>
                  <div className="col-span-10 font-medium">{selectedEmail.sender}</div>
                  
                  <div className="col-span-2 text-gray-400">Objet:</div>
                  <div className="col-span-10">{selectedEmail.subject}</div>
                </div>
              </div>
              
              <div className="bg-white text-gray-900 p-4 rounded-b-md mb-4 border-x border-b border-gray-700 min-h-[200px]">
                <p className="text-sm whitespace-pre-line">{selectedEmail.content}</p>
              </div>
              
              {/* Actions */}
              {userAnswers[selectedEmail.id] === undefined ? (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleAnswer(selectedEmail.id, true)}
                      className="flex-1"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" /> 
                      C'est du phishing
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleAnswer(selectedEmail.id, false)}
                      className="flex-1 border-green-700 text-green-500 hover:bg-green-900/20"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> 
                      Email légitime
                    </Button>
                  </div>
                  
                  {!hintUsed[selectedEmail.id] && selectedEmail.hints && (
                    <Button 
                      variant="ghost" 
                      onClick={() => useHint(selectedEmail.id)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      Utiliser un indice
                    </Button>
                  )}
                  
                  {hintUsed[selectedEmail.id] && selectedEmail.hints && (
                    <div className="bg-blue-900/20 border border-blue-800 rounded-md p-3 text-sm text-blue-300">
                      <div className="font-medium mb-1">Indices:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedEmail.hints.map((hint, index) => (
                          <li key={index}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`rounded-md p-3 mt-2 ${userAnswers[selectedEmail.id] === selectedEmail.isPhishing 
                  ? 'bg-green-900/20 border border-green-800 text-green-400' 
                  : 'bg-red-900/20 border border-red-800 text-red-400'}`}>
                  <div className="font-medium mb-1 flex items-center">
                    {userAnswers[selectedEmail.id] === selectedEmail.isPhishing ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" /> 
                        Bonne réponse!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" /> 
                        Mauvaise réponse!
                      </>
                    )}
                  </div>
                  <p className="text-sm">
                    {selectedEmail.isPhishing 
                      ? 'Cet email est une tentative de phishing. ' 
                      : 'Cet email est légitime. '}
                    {selectedEmail.hints && selectedEmail.hints[0]}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Mail className="h-12 w-12 text-gray-600 mb-4" />
              <h3 className="text-gray-400 mb-2">Sélectionnez un email</h3>
              <p className="text-sm text-gray-500">
                Analysez chaque email pour détecter les tentatives de phishing.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-800 p-3 flex justify-between">
        <div className="text-sm text-gray-400">
          {Object.keys(userAnswers).length} sur {emails.length} analysés
        </div>
        
        {showFeedback && (
          <div className="bg-gray-800 rounded-md p-2 text-sm text-center">
            <div className="font-medium">
              {calculateScore().score >= 75 ? 'Défi réussi!' : 'Défi échoué!'}
            </div>
            <div className="text-xs text-gray-400">
              Score: {calculateScore().score}% ({calculateScore().correctAnswers}/{calculateScore().totalEmails})
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PhishingChallenge;