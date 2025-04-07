import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, CheckCircle, XCircle, Mail, Shield, AlertTriangle } from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { apiRequest } from '@/lib/queryClient';

// Types pour le jeu
interface EmailExample {
  id: string;
  sender: string;
  subject: string;
  content: string;
  isPhishing: boolean;
  telltales: string[];
  explanation: string;
}

const PhishingDetectivePage: React.FC = () => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [maxLevel] = useState(10);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<EmailExample | null>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'levelComplete' | 'gameOver'>('playing');
  const [isLoading, setIsLoading] = useState(true);

  // Générer un email pour le niveau actuel
  const generateEmailForLevel = useCallback(async (level: number) => {
    setIsLoading(true);
    
    try {
      // Utiliser l'API backend pour générer un email
      const systemPrompt = `Tu es un expert en cybersécurité spécialisé dans la détection de phishing. 
        Génère un exemple d'email qui peut être légitime ou de phishing (environ 50% de chance d'être l'un ou l'autre).
        Pour un niveau ${level} (sur 10), où 1 est très facile à identifier et 10 est extrêmement difficile.
        
        Réponds UNIQUEMENT au format JSON suivant sans aucun texte additionnel:
        {
          "sender": "adresse email de l'expéditeur",
          "subject": "objet de l'email",
          "content": "contenu de l'email, incluant éventuellement des liens ou des demandes",
          "isPhishing": true/false,
          "telltales": ["signe 1 indiquant s'il s'agit de phishing ou non", "signe 2", "etc."],
          "explanation": "explication détaillée de pourquoi c'est du phishing ou non, et ce qu'il faut surveiller"
        }`;
      
      const userPrompt = `Génère un email de niveau ${level} pour le jeu Phishing Detective.`;
      
      // Utiliser l'API simple-chat pour générer le contenu
      const response = await apiRequest('/api/cyber/simple-chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userPrompt,
          config: {
            difficultyLevel: 'Intermédiaire',
            responseStyle: 'Détaillé et pédagogique',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: systemPrompt
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response || !response.content) {
        throw new Error("Réponse invalide de l'API");
      }
      
      // Extraire et parser le JSON
      let emailData: EmailExample;
      try {
        // Recherche du début et de la fin du JSON dans la réponse
        const content = response.content;
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error("Format JSON introuvable dans la réponse");
        }
        
        const jsonStr = content.substring(jsonStart, jsonEnd);
        emailData = JSON.parse(jsonStr);
        
        // Ajout d'un ID unique
        emailData.id = `email-${Date.now()}`;
        
        setCurrentEmail(emailData);
      } catch (error) {
        console.error("Erreur lors du parsing JSON:", error);
        // Utiliser des données de secours pour ne pas bloquer le jeu
        setCurrentEmail({
          id: `email-${Date.now()}`,
          sender: "support@exemple.com",
          subject: "Vérification de votre compte",
          content: "Bonjour, nous avons besoin de vérifier vos informations de compte. Veuillez cliquer sur le lien suivant: http://exemple.com/verification",
          isPhishing: true,
          telltales: ["URL suspecte", "Demande d'action urgente", "E-mail générique"],
          explanation: "Cet e-mail est suspect car il demande une action immédiate et ne vous adresse pas personnellement."
        });
      }
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer un nouveau scénario. Veuillez réessayer.",
        variant: "destructive"
      });
      console.error("Erreur:", error);
      // Utiliser des données de secours pour ne pas bloquer le jeu
      setCurrentEmail({
        id: `email-${Date.now()}`,
        sender: "contact@banque-exemple.com",
        subject: "Information importante sur votre compte",
        content: "Cher client, nous vous informons que votre compte a été temporairement suspendu. Veuillez vous connecter immédiatement: http://banque-exemple.info/login",
        isPhishing: true,
        telltales: ["Domaine suspect", "Sentiment d'urgence", "Menace implicite"],
        explanation: "Cet e-mail est un phishing car il utilise un domaine qui ressemble à celui d'une banque légitime mais avec une extension différente (.info au lieu de .com)."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Charger le premier email au démarrage
  useEffect(() => {
    generateEmailForLevel(currentLevel);
  }, [currentLevel, generateEmailForLevel]);

  // Vérifier la réponse de l'utilisateur
  const checkAnswer = (userGuess: boolean) => {
    if (!currentEmail) return;
    
    const isCorrect = userGuess === currentEmail.isPhishing;
    setUserAnswer(userGuess);
    
    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: "Bonne réponse !",
        description: "Votre analyse est correcte.",
        variant: "default",
      });
    } else {
      toast({
        title: "Mauvaise réponse",
        description: "Regardez bien les indices de phishing.",
        variant: "destructive",
      });
    }
    
    setShowExplanation(true);
  };

  // Passer au niveau suivant
  const nextLevel = () => {
    if (currentLevel < maxLevel) {
      setCurrentLevel(currentLevel + 1);
      setShowExplanation(false);
      setUserAnswer(null);
      setGameStatus('playing');
    } else {
      setGameStatus('gameOver');
    }
  };

  // Redémarrer le jeu
  const restartGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setShowExplanation(false);
    setUserAnswer(null);
    setGameStatus('playing');
    generateEmailForLevel(1);
  };

  return (
    <HomeLayout>
      <PageTitle title="PHISHING DETECTIVE" />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-900 via-gray-900 to-black py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/cyber/arcade" className="inline-flex items-center text-blue-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour à CYBER ARCADE
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Phishing Detective</h1>
              <p className="text-blue-200 mb-4">Apprenez à repérer les emails de phishing en analysant des exemples réalistes.</p>
            </div>
            <div className="bg-blue-800 rounded-lg p-3 flex items-center">
              <Mail className="text-blue-300 mr-2 h-5 w-5" />
              <span className="text-white font-bold">Niveau {currentLevel}/{maxLevel}</span>
            </div>
          </div>
          
          <div className="bg-blue-900/40 rounded-xl p-4 md:p-6 border border-blue-800 shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="bg-gray-800 h-3 rounded-full overflow-hidden">
                  <Progress value={(currentLevel / maxLevel) * 100} className="h-full" />
                </div>
              </div>
              <div className="ml-4 bg-blue-700 px-3 py-1 rounded-full text-white font-medium text-sm">
                Score: {score}/{maxLevel}
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-blue-300">Chargement d'un nouvel email...</p>
              </div>
            ) : gameStatus === 'gameOver' ? (
              <Card className="bg-gray-800 border-blue-700 p-6 text-center">
                <Trophy className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Jeu terminé !</h2>
                <p className="text-gray-300 mb-6">Vous avez obtenu un score de {score} sur {maxLevel}</p>
                
                {score === maxLevel ? (
                  <div className="bg-green-900/40 p-4 rounded-lg mb-6">
                    <p className="text-green-300 font-medium">Félicitations ! Vous maîtrisez parfaitement la détection de phishing !</p>
                  </div>
                ) : score >= maxLevel * 0.7 ? (
                  <div className="bg-blue-900/40 p-4 rounded-lg mb-6">
                    <p className="text-blue-300 font-medium">Bon travail ! Vous avez de bonnes compétences en détection de phishing.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-900/40 p-4 rounded-lg mb-6">
                    <p className="text-yellow-300 font-medium">Continuez à vous entraîner pour améliorer vos capacités de détection !</p>
                  </div>
                )}
                
                <Button onClick={restartGame} className="bg-blue-600 hover:bg-blue-700">
                  Rejouer
                </Button>
              </Card>
            ) : currentEmail ? (
              <div>
                <Card className="bg-gray-800 border-gray-700 mb-6">
                  <div className="border-b border-gray-700 p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">De:</span>
                      <span className="text-white font-medium">{currentEmail.sender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Objet:</span>
                      <span className="text-white font-bold">{currentEmail.subject}</span>
                    </div>
                  </div>
                  <div className="p-4 text-gray-200 whitespace-pre-line">
                    {currentEmail.content}
                  </div>
                </Card>
                
                {!showExplanation ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => checkAnswer(false)} 
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 py-6"
                      size="lg"
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Email légitime
                    </Button>
                    <Button 
                      onClick={() => checkAnswer(true)} 
                      className="bg-red-600 hover:bg-red-700 text-white flex-1 py-6"
                      size="lg"
                    >
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Email de phishing
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className={`p-4 rounded-lg mb-4 ${currentEmail.isPhishing ? 'bg-red-900/30 border border-red-800' : 'bg-green-900/30 border border-green-800'}`}>
                      <div className="flex items-start mb-2">
                        {currentEmail.isPhishing ? (
                          <>
                            <AlertTriangle className="text-red-400 mr-2 h-5 w-5 mt-1" />
                            <h3 className="text-xl font-bold text-red-400">
                              C'était un email de phishing !
                            </h3>
                          </>
                        ) : (
                          <>
                            <Shield className="text-green-400 mr-2 h-5 w-5 mt-1" />
                            <h3 className="text-xl font-bold text-green-400">
                              C'était un email légitime.
                            </h3>
                          </>
                        )}
                      </div>
                      
                      <div className="ml-7">
                        <p className="text-gray-200 mb-4">{currentEmail.explanation}</p>
                        
                        <h4 className="font-semibold text-gray-100 mb-2">Indices à surveiller :</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 mb-4">
                          {currentEmail.telltales.map((telltale, index) => (
                            <li key={index}>{telltale}</li>
                          ))}
                        </ul>
                        
                        <div className="flex items-center mt-2">
                          {userAnswer === currentEmail.isPhishing ? (
                            <>
                              <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                              <span className="text-green-400 font-medium">Vous avez correctement identifié cet email !</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500 mr-2 h-5 w-5" />
                              <span className="text-red-400 font-medium">Vous n'avez pas correctement identifié cet email.</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={nextLevel}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-4"
                      size="lg"
                    >
                      Continuer
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-400">Erreur lors du chargement de l'email. Veuillez rafraîchir la page.</p>
              </div>
            )}
          </div>
          
          <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-800/50">
            <h2 className="text-xl font-bold text-white mb-4">Conseils pour identifier les emails de phishing :</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-blue-700 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-white" />
                </span>
                <span className="text-blue-100">Vérifiez attentivement l'adresse email de l'expéditeur (recherchez des fautes d'orthographe subtiles)</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-700 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-white" />
                </span>
                <span className="text-blue-100">Méfiez-vous des demandes urgentes ou des menaces visant à vous faire agir rapidement</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-700 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-white" />
                </span>
                <span className="text-blue-100">Survolez les liens (sans cliquer) pour voir l'URL réelle</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-700 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-white" />
                </span>
                <span className="text-blue-100">Soyez vigilant face aux fautes de grammaire et d'orthographe</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-700 rounded-full p-1 mr-3 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-white" />
                </span>
                <span className="text-blue-100">Ne communiquez jamais d'informations sensibles par email</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default PhishingDetectivePage;