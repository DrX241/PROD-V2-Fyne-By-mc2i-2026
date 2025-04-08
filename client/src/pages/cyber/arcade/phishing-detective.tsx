import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Trophy, CheckCircle, XCircle, Mail, Shield, AlertTriangle, 
  ArrowRight, Cpu, Eye, EyeOff, Search, RefreshCw, Lightbulb, HelpCircle, Link2, Code
} from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { apiRequest } from '@/lib/queryClient';

// Types pour le jeu
interface EmailSender {
  name: string;
  email: string;
}

interface EmailContent {
  html: string;
  plainText: string;
}

interface EmailIndicators {
  suspicious: string[];
  legitimate: string[];
}

interface EmailAnalysis {
  explanation: string;
  riskLevel: 'faible' | 'moyen' | 'élevé';
  techniques: string[];
  recommendations: string[];
}

interface AIAnalysisResult {
  analysisTitle: string;
  summary: string;
  correctAssessment: boolean;
  keyIndicators: {
    suspicious: string[];
    legitimate: string[];
  };
  technicalAnalysis: string;
  learningPoints: string[];
  expertTips: string[];
  nextLevelChallenge: string;
  model?: string;
}

interface EmailExample {
  id: string;
  sender: EmailSender;
  subject: string;
  date: string;
  content: EmailContent;
  isPhishing: boolean;
  indicators: EmailIndicators;
  analysis: EmailAnalysis;
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
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isRequestingAnalysis, setIsRequestingAnalysis] = useState(false);

  // Générer un email pour le niveau actuel
  const generateEmailForLevel = useCallback(async (level: number) => {
    setIsLoading(true);
    
    try {
      // Utiliser notre nouvel endpoint dédié à la génération d'emails réalistes
      const response = await apiRequest('/api/cyber/phishing-detective/generate-email', {
        method: 'POST',
        body: JSON.stringify({ level }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response) {
        throw new Error("Réponse invalide de l'API");
      }
      
      // L'email est déjà au format attendu et prêt à être utilisé
      setCurrentEmail(response);
      
      // Afficher quel modèle AI a été utilisé
      const modelInfo = response.model || 'gpt-4o';
      console.log(`Email généré par le modèle: ${modelInfo}`);
      
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer un exemple d'email réaliste. Utilisation d'un exemple de secours.",
        variant: "destructive"
      });
      console.error("Erreur de génération d'email:", error);
      
      // Utiliser des données de secours avec le nouveau format
      setCurrentEmail({
        id: `email-${Date.now()}`,
        sender: {
          name: "Support Technique",
          email: "support@servlce-client.com" // Remarquez la faute intentionnelle: 'l' au lieu de 'i'
        },
        subject: "Alerte de sécurité - Action requise immédiatement",
        date: new Date().toLocaleString(),
        content: {
          html: `<div style="font-family: Arial, sans-serif;">
            <div style="color: #003366; font-size: 16px; font-weight: bold;">NOTIFICATION IMPORTANTE</div>
            <p>Cher(e) client(e),</p>
            <p>Nous avons détecté une <strong>activité inhabituelle</strong> sur votre compte. Pour des raisons de sécurité, votre accès a été temporairement limité.</p>
            <p>Veuillez <a href="http://verification-compte-securite.com/login">vérifier votre identité</a> dans les 24 heures pour éviter la suspension de votre compte.</p>
            <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
              <div style="color: #666; font-size: 12px;">Service Sécurité</div>
              <div style="color: #666; font-size: 12px;">© 2025 Tous droits réservés</div>
            </div>
          </div>`,
          plainText: "NOTIFICATION IMPORTANTE\n\nCher(e) client(e),\n\nNous avons détecté une activité inhabituelle sur votre compte. Pour des raisons de sécurité, votre accès a été temporairement limité.\n\nVeuillez vérifier votre identité (http://verification-compte-securite.com/login) dans les 24 heures pour éviter la suspension de votre compte.\n\nService Sécurité\n© 2025 Tous droits réservés"
        },
        isPhishing: true,
        indicators: {
          suspicious: [
            "Domaine suspect dans l'adresse email (servlce-client.com avec un 'l' au lieu de 'i')",
            "Urgence créée artificiellement",
            "Lien vers un site non officiel",
            "Absence d'informations personnalisées",
            "Menace de suspension du compte"
          ],
          legitimate: [
            "Mise en forme professionnelle",
            "Absence de fautes d'orthographe évidentes",
            "Signature et copyright inclus"
          ]
        },
        analysis: {
          explanation: "Ce message est une tentative de phishing car il essaie de créer un sentiment d'urgence pour inciter l'utilisateur à cliquer sur un lien suspect. L'adresse de l'expéditeur contient une subtile modification (servlce au lieu de service). Le message ne contient aucune information personnalisée qui prouverait que l'expéditeur connaît réellement le destinataire.",
          riskLevel: "élevé",
          techniques: ["Usurpation d'identité", "Création d'urgence", "Typosquatting", "Manipulation psychologique"],
          recommendations: [
            "Vérifier toujours attentivement l'adresse email de l'expéditeur",
            "Ne jamais cliquer sur des liens dans des emails demandant des actions urgentes",
            "Contacter directement l'organisation concernée via ses canaux officiels"
          ]
        }
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

  // Demander une analyse approfondie à l'IA
  const requestAIAnalysis = async () => {
    if (!currentEmail || !userAnswer) return;
    
    setIsRequestingAnalysis(true);
    
    try {
      const response = await apiRequest('/api/cyber/phishing-detective/analyze-email', {
        method: 'POST',
        body: JSON.stringify({
          email: currentEmail,
          userGuess: userAnswer
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response) {
        throw new Error("Réponse invalide de l'API d'analyse");
      }
      
      setAiAnalysis(response);
      
      toast({
        title: "Analyse complétée",
        description: `L'expert IA a analysé votre décision.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error("Erreur lors de l'analyse par IA:", error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'obtenir l'analyse détaillée. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsRequestingAnalysis(false);
    }
  };

  // Passer au niveau suivant
  const nextLevel = () => {
    if (currentLevel < maxLevel) {
      setCurrentLevel(currentLevel + 1);
      setShowExplanation(false);
      setUserAnswer(null);
      setGameStatus('playing');
      setAiAnalysis(null); // Réinitialiser l'analyse IA
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
    setAiAnalysis(null); // Réinitialiser l'analyse IA
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
                <Tabs defaultValue="rendered" className="mb-4">
                  <TabsList className="bg-gray-700 border-b border-gray-600 mb-4 w-full justify-start">
                    <TabsTrigger value="rendered" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="source" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                      <Code className="h-4 w-4 mr-2" />
                      Source
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="rendered" className="mt-0">
                    <Card className="bg-gray-800 border-gray-700 overflow-hidden">
                      <div className="border-b border-gray-700 p-4">
                        <div className="grid grid-cols-4 mb-2 text-sm">
                          <span className="text-gray-400">De:</span>
                          <div className="col-span-3 text-white">
                            <span className="font-medium">{currentEmail.sender.name}</span>
                            <span className="text-gray-400 ml-2 text-xs">&lt;{currentEmail.sender.email}&gt;</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 mb-2 text-sm">
                          <span className="text-gray-400">À:</span>
                          <span className="col-span-3 text-gray-300">vous@votre-entreprise.com</span>
                        </div>
                        <div className="grid grid-cols-4 mb-2 text-sm">
                          <span className="text-gray-400">Date:</span>
                          <span className="col-span-3 text-gray-300">{currentEmail.date}</span>
                        </div>
                        <div className="grid grid-cols-4 text-sm">
                          <span className="text-gray-400">Objet:</span>
                          <span className="col-span-3 text-white font-bold">{currentEmail.subject}</span>
                        </div>
                      </div>
                      <div className="p-4 text-gray-200 overflow-auto max-h-[300px]" 
                           dangerouslySetInnerHTML={{ __html: currentEmail.content.html }}></div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="source" className="mt-0">
                    <Card className="bg-gray-800 border-gray-700">
                      <div className="p-4">
                        <div className="font-mono text-xs text-gray-300 whitespace-pre-wrap bg-gray-900 p-3 rounded-md overflow-auto max-h-[400px]">
                          <div className="mb-2 pb-2 border-b border-gray-700">
                            <span className="text-blue-300">From:</span> {currentEmail.sender.name} &lt;{currentEmail.sender.email}&gt;<br/>
                            <span className="text-blue-300">To:</span> vous@votre-entreprise.com<br/>
                            <span className="text-blue-300">Subject:</span> {currentEmail.subject}<br/>
                            <span className="text-blue-300">Date:</span> {currentEmail.date}<br/>
                          </div>
                          {currentEmail.content.plainText}
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
                
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
                        <p className="text-gray-200 mb-4">{currentEmail.analysis.explanation}</p>
                        
                        <h4 className="font-semibold text-gray-100 mb-2">Niveau de risque :</h4>
                        <div className="mb-4">
                          <Badge className={
                            currentEmail.analysis.riskLevel === 'élevé' ? "bg-red-600" : 
                            currentEmail.analysis.riskLevel === 'moyen' ? "bg-yellow-600" : 
                            "bg-blue-600"
                          }>
                            {currentEmail.analysis.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <h4 className="font-semibold text-gray-100 mb-2">Indices suspects :</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 mb-4">
                          {currentEmail.indicators.suspicious.map((indicator, index) => (
                            <li key={index}>{indicator}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-semibold text-gray-100 mb-2">Éléments qui semblent légitimes :</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 mb-4">
                          {currentEmail.indicators.legitimate.map((indicator, index) => (
                            <li key={index}>{indicator}</li>
                          ))}
                        </ul>
                        
                        <h4 className="font-semibold text-gray-100 mb-2">Techniques utilisées :</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {currentEmail.analysis.techniques.map((technique, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-700/50">
                              {technique}
                            </Badge>
                          ))}
                        </div>
                        
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
                    
                    <div className="flex gap-4 mt-4">
                      {!aiAnalysis && !isRequestingAnalysis && (
                        <Button 
                          onClick={requestAIAnalysis}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                          size="lg"
                        >
                          <Cpu className="mr-2 h-5 w-5" />
                          Demander analyse IA
                        </Button>
                      )}
                      <Button 
                        onClick={nextLevel}
                        className={`${aiAnalysis || isRequestingAnalysis ? 'w-full' : 'flex-1'} bg-blue-600 hover:bg-blue-700 py-4`}
                        size="lg"
                      >
                        {aiAnalysis ? "Niveau suivant" : "Continuer"}
                      </Button>
                    </div>
                    
                    {isRequestingAnalysis && (
                      <div className="mt-6 p-4 bg-gray-800/80 rounded-lg border border-gray-700 flex items-center justify-center">
                        <div className="flex items-center">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                          <span className="text-purple-300">L'IA analyse votre décision...</span>
                        </div>
                      </div>
                    )}
                    
                    {aiAnalysis && (
                      <div className="mt-6 bg-gray-900/80 rounded-lg border border-purple-800 overflow-hidden">
                        <div className="bg-purple-900/40 p-4 flex items-center border-b border-purple-800/50">
                          <Cpu className="text-purple-400 mr-2 h-5 w-5" />
                          <h3 className="text-lg font-bold text-purple-300">
                            {aiAnalysis.analysisTitle}
                          </h3>
                          {aiAnalysis.model && (
                            <Badge variant="outline" className="ml-auto text-xs bg-purple-950/50 border-purple-700">
                              {aiAnalysis.model}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="mb-4 pb-4 border-b border-gray-800">
                            <div className={`flex items-center mb-2 ${aiAnalysis.correctAssessment ? 'text-green-400' : 'text-amber-400'}`}>
                              {aiAnalysis.correctAssessment ? (
                                <CheckCircle className="mr-2 h-5 w-5" />
                              ) : (
                                <AlertTriangle className="mr-2 h-5 w-5" />
                              )}
                              <p className="font-medium">{aiAnalysis.summary}</p>
                            </div>
                            <p className="text-gray-300 whitespace-pre-line">{aiAnalysis.technicalAnalysis}</p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-purple-300 flex items-center mb-2">
                                <Search className="h-4 w-4 mr-1" />
                                Indicateurs clés
                              </h4>
                              <div className="bg-gray-800/50 rounded p-3">
                                <div className="mb-2">
                                  <h5 className="text-xs uppercase text-gray-400 mb-1">Éléments suspects</h5>
                                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                                    {aiAnalysis.keyIndicators.suspicious.map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-xs uppercase text-gray-400 mb-1">Éléments légitimes</h5>
                                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                                    {aiAnalysis.keyIndicators.legitimate.map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-purple-300 flex items-center mb-2">
                                <Lightbulb className="h-4 w-4 mr-1" />
                                Points d'apprentissage
                              </h4>
                              <div className="bg-gray-800/50 rounded p-3">
                                <ul className="list-disc list-inside space-y-1 text-gray-300">
                                  {aiAnalysis.learningPoints.map((point, idx) => (
                                    <li key={idx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <h4 className="font-semibold text-purple-300 flex items-center mb-2 mt-4">
                                <HelpCircle className="h-4 w-4 mr-1" />
                                Conseils d'expert
                              </h4>
                              <div className="bg-gray-800/50 rounded p-3">
                                <ul className="list-disc list-inside space-y-1 text-gray-300">
                                  {aiAnalysis.expertTips.map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-800">
                            <h4 className="font-semibold text-purple-300 flex items-center mb-2">
                              <ArrowRight className="h-4 w-4 mr-1" />
                              Prochain défi
                            </h4>
                            <p className="text-gray-300">{aiAnalysis.nextLevelChallenge}</p>
                          </div>
                        </div>
                      </div>
                    )}
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