import React, { useState } from 'react';
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, BookOpen, Shield, AlertTriangle, Lock, Eye, User, Smartphone, Laptop, Wifi, Lightbulb, HardDrive } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import PageTitle from "@/components/utils/PageTitle";

export default function DebutantCyber() {
  // États pour le module
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [playgroundState, setPlaygroundState] = useState({
    passwordStrength: 0,
    securityChecks: {
      updates: false,
      antivirus: false,
      password: false,
      backup: false
    }
  });
  
  const { toast } = useToast();
  
  // Simuler la progression lorsque la page est chargée
  React.useEffect(() => {
    updateProgress();
  }, [currentStep, quizAnswers, playgroundState]);
  
  // Mettre à jour la progression
  const updateProgress = () => {
    // Calculer la progression basée sur l'étape actuelle et les interactions
    let newProgress = Math.min(Math.floor((currentStep / 5) * 100), 100);
    
    // Ajouter des points pour les réponses au quiz
    const quizAnswersCount = Object.keys(quizAnswers).length;
    if (quizAnswersCount > 0 && currentStep >= 3) {
      newProgress += 5;
    }
    
    // Ajouter des points pour les actions dans le playground
    const securityChecksCompleted = Object.values(playgroundState.securityChecks).filter(v => v).length;
    if (securityChecksCompleted > 0 && currentStep >= 4) {
      newProgress += securityChecksCompleted * 5;
    }
    
    // Limiter à 100%
    newProgress = Math.min(newProgress, 100);
    
    setProgress(newProgress);
  };
  
  // Gérer les choix dans le quiz
  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: answer
    });
    
    toast({
      title: "Réponse enregistrée",
      description: "Votre réponse a été prise en compte.",
    });
  };
  
  // Gérer les actions dans le playground
  const toggleSecurityCheck = (check) => {
    setPlaygroundState({
      ...playgroundState,
      securityChecks: {
        ...playgroundState.securityChecks,
        [check]: !playgroundState.securityChecks[check]
      }
    });
    
    toast({
      title: "Action effectuée",
      description: `Vous avez ${!playgroundState.securityChecks[check] ? 'activé' : 'désactivé'} cette mesure de sécurité.`,
    });
  };
  
  // Évaluer la force du mot de passe
  const evaluatePassword = (password) => {
    let strength = 0;
    
    if (password.length > 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    
    setPlaygroundState({
      ...playgroundState,
      passwordStrength: strength
    });
    
    if (strength >= 75) {
      setPlaygroundState({
        ...playgroundState,
        passwordStrength: strength,
        securityChecks: {
          ...playgroundState.securityChecks,
          password: true
        }
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Débuter en Cybersécurité | Centre de formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-amber-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-amber-300 hover:bg-amber-900/30 hover:text-amber-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Premiers pas en cybersécurité</h1>
          
          <div className="ml-auto flex items-center">
            <div className="w-48 mr-4">
              <Progress value={progress} className="h-2 bg-amber-950 text-amber-500" />
            </div>
            <span className="text-sm text-amber-300">{progress}% complété</span>
          </div>
        </div>
      </div>
      
      {/* Contenu principal du module */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation des étapes */}
          <div className="lg:col-span-1">
            <div className="bg-amber-950/40 border border-amber-800/40 rounded-lg p-4 sticky top-4">
              <h3 className="text-amber-400 font-semibold mb-4">Votre parcours</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setCurrentStep(1)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors ${
                    currentStep === 1 
                      ? 'bg-amber-800/60 text-white' 
                      : 'text-amber-300 hover:bg-amber-900/40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    progress >= 20 ? 'bg-amber-600' : 'bg-amber-950 border border-amber-700'
                  }`}>
                    {progress >= 20 ? <CheckCircle2 className="h-4 w-4 text-amber-100" /> : <span className="text-amber-400">1</span>}
                  </div>
                  <span>Introduction</span>
                </button>
                
                <button 
                  onClick={() => setCurrentStep(2)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors ${
                    currentStep === 2 
                      ? 'bg-amber-800/60 text-white' 
                      : 'text-amber-300 hover:bg-amber-900/40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    progress >= 40 ? 'bg-amber-600' : 'bg-amber-950 border border-amber-700'
                  }`}>
                    {progress >= 40 ? <CheckCircle2 className="h-4 w-4 text-amber-100" /> : <span className="text-amber-400">2</span>}
                  </div>
                  <span>Les risques quotidiens</span>
                </button>
                
                <button 
                  onClick={() => setCurrentStep(3)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors ${
                    currentStep === 3 
                      ? 'bg-amber-800/60 text-white' 
                      : 'text-amber-300 hover:bg-amber-900/40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    progress >= 60 ? 'bg-amber-600' : 'bg-amber-950 border border-amber-700'
                  }`}>
                    {progress >= 60 ? <CheckCircle2 className="h-4 w-4 text-amber-100" /> : <span className="text-amber-400">3</span>}
                  </div>
                  <span>Quiz interactif</span>
                </button>
                
                <button 
                  onClick={() => setCurrentStep(4)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors ${
                    currentStep === 4 
                      ? 'bg-amber-800/60 text-white' 
                      : 'text-amber-300 hover:bg-amber-900/40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    progress >= 80 ? 'bg-amber-600' : 'bg-amber-950 border border-amber-700'
                  }`}>
                    {progress >= 80 ? <CheckCircle2 className="h-4 w-4 text-amber-100" /> : <span className="text-amber-400">4</span>}
                  </div>
                  <span>Playground sécurité</span>
                </button>
                
                <button 
                  onClick={() => setCurrentStep(5)}
                  className={`w-full flex items-center p-3 rounded-md transition-colors ${
                    currentStep === 5 
                      ? 'bg-amber-800/60 text-white' 
                      : 'text-amber-300 hover:bg-amber-900/40'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                    progress >= 100 ? 'bg-amber-600' : 'bg-amber-950 border border-amber-700'
                  }`}>
                    {progress >= 100 ? <CheckCircle2 className="h-4 w-4 text-amber-100" /> : <span className="text-amber-400">5</span>}
                  </div>
                  <span>Conclusion et certificat</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Section principale de contenu */}
          <div className="lg:col-span-3 space-y-8">
            {/* Étape 1: Introduction */}
            {currentStep === 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-amber-950/40 border-amber-800/40 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 h-20 w-20 flex items-center justify-center">
                        <Shield className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Bienvenue dans votre module "Premiers pas en cybersécurité"</h2>
                    
                    <p className="text-amber-200 text-center mb-6">
                      Ce module est conçu pour les personnes qui découvrent la cybersécurité. 
                      Vous apprendrez les bases essentielles pour vous protéger et comprendre les risques en ligne.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-700/50 text-center">
                        <div className="flex justify-center mb-3">
                          <Eye className="h-8 w-8 text-amber-400" />
                        </div>
                        <h4 className="font-medium text-white mb-2">Sensibilisation</h4>
                        <p className="text-sm text-amber-200">Identifier les risques numériques du quotidien</p>
                      </div>
                      
                      <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-700/50 text-center">
                        <div className="flex justify-center mb-3">
                          <Shield className="h-8 w-8 text-amber-400" />
                        </div>
                        <h4 className="font-medium text-white mb-2">Protection</h4>
                        <p className="text-sm text-amber-200">Apprendre les gestes essentiels pour se protéger</p>
                      </div>
                      
                      <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-700/50 text-center">
                        <div className="flex justify-center mb-3">
                          <Lightbulb className="h-8 w-8 text-amber-400" />
                        </div>
                        <h4 className="font-medium text-white mb-2">Pratique</h4>
                        <p className="text-sm text-amber-200">Mettre en œuvre des bonnes pratiques simples et efficaces</p>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-950/50 border-blue-800/60 mb-6">
                      <Lightbulb className="h-4 w-4 text-blue-400" />
                      <AlertTitle className="text-blue-400">Le saviez-vous ?</AlertTitle>
                      <AlertDescription className="text-blue-200">
                        Plus de 80% des incidents de cybersécurité pourraient être évités en appliquant simplement les bonnes pratiques de base.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-center">
                      <Button 
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-6 py-6"
                        onClick={() => setCurrentStep(2)}
                      >
                        Commencer l'apprentissage
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Étape 2: Les risques quotidiens */}
            {currentStep === 2 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-amber-950/40 border-amber-800/40 shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Les risques numériques du quotidien</h2>
                    
                    <p className="text-amber-200 mb-6">
                      Dans votre vie quotidienne, vous êtes exposé à différentes menaces numériques. Voici les principales que vous devez connaître et savoir identifier.
                    </p>
                    
                    <Tabs defaultValue="phishing" className="w-full">
                      <TabsList className="grid grid-cols-3 mb-6">
                        <TabsTrigger value="phishing" className="data-[state=active]:bg-amber-700">Phishing</TabsTrigger>
                        <TabsTrigger value="passwords" className="data-[state=active]:bg-amber-700">Mots de passe</TabsTrigger>
                        <TabsTrigger value="devices" className="data-[state=active]:bg-amber-700">Appareils</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="phishing">
                        <div className="space-y-4">
                          <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-700/50">
                            <h3 className="text-xl font-medium text-white mb-3">Le phishing (hameçonnage)</h3>
                            <p className="text-amber-200 mb-4">
                              Le phishing est une technique de fraude où l'attaquant se fait passer pour une entité de confiance (banque, service public, site web populaire) 
                              pour vous inciter à divulguer des informations personnelles.
                            </p>
                            
                            <div className="bg-amber-950/50 p-4 rounded-lg mb-4">
                              <h4 className="font-medium text-white mb-2">Comment reconnaître un email de phishing ?</h4>
                              <ul className="space-y-2 text-amber-200">
                                <li className="flex items-start">
                                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>Fautes d'orthographe et de grammaire</span>
                                </li>
                                <li className="flex items-start">
                                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>Adresse d'expéditeur suspecte</span>
                                </li>
                                <li className="flex items-start">
                                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>Demande urgente d'informations personnelles</span>
                                </li>
                                <li className="flex items-start">
                                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" />
                                  <span>Liens dont l'URL est différente de celle affichée</span>
                                </li>
                              </ul>
                            </div>
                            
                            <Alert className="bg-red-950/50 border-red-800/60">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <AlertTitle className="text-red-400">Que faire en cas de doute ?</AlertTitle>
                              <AlertDescription className="text-red-200">
                                Ne cliquez jamais sur les liens suspects. Contactez directement l'organisation concernée via ses canaux officiels (numéro de téléphone sur leur site web officiel).
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="passwords">
                        <div className="space-y-4">
                          <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-700/50">
                            <h3 className="text-xl font-medium text-white mb-3">La sécurité des mots de passe</h3>
                            <p className="text-amber-200 mb-4">
                              Les mots de passe faibles ou réutilisés sont l'une des principales vulnérabilités exploitées par les cybercriminels.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-red-950/40 p-4 rounded-lg border border-red-800/30">
                                <h4 className="font-medium text-white mb-2 flex items-center">
                                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                                  Pratiques à éviter
                                </h4>
                                <ul className="space-y-2 text-amber-200 pl-6 list-disc">
                                  <li>Utiliser le même mot de passe partout</li>
                                  <li>Choisir des mots de passe trop simples (123456, password, etc.)</li>
                                  <li>Inclure des informations personnelles (date de naissance, nom)</li>
                                  <li>Noter vos mots de passe sur un papier visible</li>
                                </ul>
                              </div>
                              
                              <div className="bg-green-950/40 p-4 rounded-lg border border-green-800/30">
                                <h4 className="font-medium text-white mb-2 flex items-center">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                  Bonnes pratiques
                                </h4>
                                <ul className="space-y-2 text-amber-200 pl-6 list-disc">
                                  <li>Utiliser un gestionnaire de mots de passe</li>
                                  <li>Créer des mots de passe longs et complexes</li>
                                  <li>Activer l'authentification à deux facteurs (2FA)</li>
                                  <li>Changer régulièrement vos mots de passe importants</li>
                                </ul>
                              </div>
                            </div>
                            
                            <Alert className="bg-blue-950/50 border-blue-800/60">
                              <Lightbulb className="h-4 w-4 text-blue-400" />
                              <AlertTitle className="text-blue-400">Conseil pratique</AlertTitle>
                              <AlertDescription className="text-blue-200">
                                Une phrase de passe (succession de plusieurs mots avec ponctuation) est souvent plus sécurisée et plus facile à retenir qu'un mot de passe court et complexe.
                              </AlertDescription>
                            </Alert>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="devices">
                        <div className="space-y-4">
                          <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-700/50">
                            <h3 className="text-xl font-medium text-white mb-3">Sécuriser vos appareils</h3>
                            <p className="text-amber-200 mb-4">
                              Vos appareils (ordinateur, smartphone, tablette) contiennent une grande quantité d'informations personnelles qu'il est essentiel de protéger.
                            </p>
                            
                            <div className="grid grid-cols-1 gap-4 mb-4">
                              <div className="flex bg-amber-950/50 p-4 rounded-lg">
                                <Smartphone className="h-10 w-10 text-amber-400 mr-4 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-white mb-2">Smartphones et tablettes</h4>
                                  <ul className="space-y-1 text-amber-200">
                                    <li>• Verrouillez votre appareil avec un code PIN, empreinte ou reconnaissance faciale</li>
                                    <li>• N'installez que des applications de sources officielles (App Store, Google Play)</li>
                                    <li>• Vérifiez les permissions demandées par les applications</li>
                                    <li>• Activez le chiffrement de votre appareil</li>
                                  </ul>
                                </div>
                              </div>
                              
                              <div className="flex bg-amber-950/50 p-4 rounded-lg">
                                <Laptop className="h-10 w-10 text-amber-400 mr-4 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-white mb-2">Ordinateurs</h4>
                                  <ul className="space-y-1 text-amber-200">
                                    <li>• Maintenez votre système d'exploitation et vos logiciels à jour</li>
                                    <li>• Utilisez un antivirus/anti-malware et gardez-le à jour</li>
                                    <li>• Activez le pare-feu de votre système</li>
                                    <li>• Réalisez des sauvegardes régulières de vos données importantes</li>
                                  </ul>
                                </div>
                              </div>
                              
                              <div className="flex bg-amber-950/50 p-4 rounded-lg">
                                <Wifi className="h-10 w-10 text-amber-400 mr-4 flex-shrink-0" />
                                <div>
                                  <h4 className="font-medium text-white mb-2">Réseau et connexions</h4>
                                  <ul className="space-y-1 text-amber-200">
                                    <li>• Sécurisez votre réseau Wi-Fi domestique avec un mot de passe fort</li>
                                    <li>• Méfiez-vous des réseaux Wi-Fi publics (utilisez un VPN si nécessaire)</li>
                                    <li>• Désactivez le Bluetooth et le Wi-Fi lorsque vous ne les utilisez pas</li>
                                    <li>• Visitez uniquement des sites web sécurisés (https://)</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        className="border-amber-600 text-amber-400 hover:bg-amber-900/30"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Précédent
                      </Button>
                      
                      <Button 
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white"
                        onClick={() => setCurrentStep(3)}
                      >
                        Suivant
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Étape 3: Quiz interactif */}
            {currentStep === 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-amber-950/40 border-amber-800/40 shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Quiz: Testez vos connaissances</h2>
                    
                    <p className="text-amber-200 mb-6">
                      Mettez en pratique ce que vous avez appris en répondant à ces questions sur la cybersécurité de base.
                    </p>
                    
                    <div className="space-y-8">
                      {/* Question 1 */}
                      <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-700/50">
                        <h3 className="text-lg font-medium text-white mb-3">Question 1: Le phishing, c'est...</h3>
                        
                        <div className="space-y-3">
                          <button 
                            onClick={() => handleQuizAnswer('q1', 'a')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q1 === 'a' 
                                ? 'bg-amber-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            a) Une technique de pêche sportive en ligne
                          </button>
                          
                          <button 
                            onClick={() => handleQuizAnswer('q1', 'b')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q1 === 'b' 
                                ? 'bg-green-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            b) Une technique pour vous inciter à divulguer des informations personnelles
                          </button>
                          
                          <button 
                            onClick={() => handleQuizAnswer('q1', 'c')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q1 === 'c' 
                                ? 'bg-amber-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            c) Un logiciel antivirus
                          </button>
                        </div>
                        
                        {quizAnswers.q1 === 'b' && (
                          <Alert className="bg-green-900/30 border-green-700 mt-4">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <AlertTitle className="text-green-400">Bonne réponse!</AlertTitle>
                            <AlertDescription className="text-green-200">
                              Le phishing est effectivement une technique où les cybercriminels se font passer pour des entités de confiance pour vous inciter à partager des informations personnelles.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {(quizAnswers.q1 === 'a' || quizAnswers.q1 === 'c') && (
                          <Alert className="bg-red-900/30 border-red-700 mt-4">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertTitle className="text-red-400">Pas tout à fait...</AlertTitle>
                            <AlertDescription className="text-red-200">
                              Le phishing est une technique frauduleuse où les cybercriminels se font passer pour des entités de confiance afin de vous inciter à partager des informations personnelles.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      {/* Question 2 */}
                      <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-700/50">
                        <h3 className="text-lg font-medium text-white mb-3">Question 2: Lequel de ces mots de passe est le plus sécurisé?</h3>
                        
                        <div className="space-y-3">
                          <button 
                            onClick={() => handleQuizAnswer('q2', 'a')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q2 === 'a' 
                                ? 'bg-amber-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            a) password123
                          </button>
                          
                          <button 
                            onClick={() => handleQuizAnswer('q2', 'b')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q2 === 'b' 
                                ? 'bg-amber-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            b) VotrePrenom1990
                          </button>
                          
                          <button 
                            onClick={() => handleQuizAnswer('q2', 'c')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q2 === 'c' 
                                ? 'bg-green-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            c) Tr0isi3m3*Ch@t!Bizarre
                          </button>
                        </div>
                        
                        {quizAnswers.q2 === 'c' && (
                          <Alert className="bg-green-900/30 border-green-700 mt-4">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <AlertTitle className="text-green-400">Bonne réponse!</AlertTitle>
                            <AlertDescription className="text-green-200">
                              Ce mot de passe est le plus sécurisé car il est long, contient des majuscules, des chiffres, des caractères spéciaux et n'est pas basé sur des informations personnelles faciles à deviner.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {(quizAnswers.q2 === 'a' || quizAnswers.q2 === 'b') && (
                          <Alert className="bg-red-900/30 border-red-700 mt-4">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertTitle className="text-red-400">Pas tout à fait...</AlertTitle>
                            <AlertDescription className="text-red-200">
                              Les mots de passe trop courts, trop simples ou qui contiennent des informations personnelles (comme votre prénom) sont facilement devinables ou vulnérables aux attaques par force brute.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      
                      {/* Question 3 */}
                      <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-700/50">
                        <h3 className="text-lg font-medium text-white mb-3">Question 3: Quelle est la meilleure pratique pour sécuriser vos appareils?</h3>
                        
                        <div className="space-y-3">
                          <button 
                            onClick={() => handleQuizAnswer('q3', 'a')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q3 === 'a' 
                                ? 'bg-amber-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            a) Ne jamais mettre à jour les logiciels car les mises à jour peuvent contenir des bugs
                          </button>
                          
                          <button 
                            onClick={() => handleQuizAnswer('q3', 'b')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q3 === 'b' 
                                ? 'bg-green-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            b) Maintenir vos systèmes à jour et utiliser un antivirus
                          </button>
                          
                          <button 
                            onClick={() => handleQuizAnswer('q3', 'c')}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                              quizAnswers.q3 === 'c' 
                                ? 'bg-amber-700 text-white' 
                                : 'bg-amber-950/50 text-amber-200 hover:bg-amber-900/30'
                            }`}
                          >
                            c) Partager vos mots de passe avec vos amis pour qu'ils puissent vous aider en cas de problème
                          </button>
                        </div>
                        
                        {quizAnswers.q3 === 'b' && (
                          <Alert className="bg-green-900/30 border-green-700 mt-4">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <AlertTitle className="text-green-400">Bonne réponse!</AlertTitle>
                            <AlertDescription className="text-green-200">
                              Maintenir vos systèmes et logiciels à jour est essentiel car les mises à jour contiennent souvent des correctifs de sécurité. Un antivirus à jour est également une protection importante.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {(quizAnswers.q3 === 'a' || quizAnswers.q3 === 'c') && (
                          <Alert className="bg-red-900/30 border-red-700 mt-4">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertTitle className="text-red-400">Pas tout à fait...</AlertTitle>
                            <AlertDescription className="text-red-200">
                              Les mises à jour sont cruciales car elles corrigent des failles de sécurité. Et vos mots de passe doivent rester strictement confidentiels, même avec vos proches.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        className="border-amber-600 text-amber-400 hover:bg-amber-900/30"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Précédent
                      </Button>
                      
                      <Button 
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white"
                        onClick={() => setCurrentStep(4)}
                        disabled={Object.keys(quizAnswers).length < 3}
                      >
                        Suivant
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Étape 4: Playground sécurité */}
            {currentStep === 4 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-amber-950/40 border-amber-800/40 shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Playground: Sécurisez vos systèmes</h2>
                    
                    <p className="text-amber-200 mb-6">
                      Mettez en pratique les concepts appris en sécurisant un système virtuel. Activez les bonnes mesures de sécurité pour protéger les données.
                    </p>
                    
                    <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg p-5 mb-6">
                      <div className="flex items-center mb-4">
                        <Laptop className="h-6 w-6 text-blue-400 mr-3" />
                        <h3 className="text-xl font-medium text-white">Simulation d'ordinateur</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Mesures de sécurité */}
                        <div>
                          <h4 className="text-blue-300 font-medium mb-3">Mesures de sécurité</h4>
                          
                          <div className="space-y-3">
                            <div 
                              className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                playgroundState.securityChecks.updates 
                                  ? 'bg-green-900/30 border border-green-700/50' 
                                  : 'bg-blue-900/30 border border-blue-700/50 hover:bg-blue-900/50'
                              }`}
                              onClick={() => toggleSecurityCheck('updates')}
                            >
                              <div className="flex items-center">
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${
                                  playgroundState.securityChecks.updates 
                                    ? 'bg-green-500' 
                                    : 'border border-blue-400'
                                }`}>
                                  {playgroundState.securityChecks.updates && (
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <span className="text-white">Mises à jour automatiques</span>
                              </div>
                              
                              <Badge className={playgroundState.securityChecks.updates ? 'bg-green-700' : 'bg-blue-700'}>
                                {playgroundState.securityChecks.updates ? 'Activé' : 'Désactivé'}
                              </Badge>
                            </div>
                            
                            <div 
                              className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                playgroundState.securityChecks.antivirus 
                                  ? 'bg-green-900/30 border border-green-700/50' 
                                  : 'bg-blue-900/30 border border-blue-700/50 hover:bg-blue-900/50'
                              }`}
                              onClick={() => toggleSecurityCheck('antivirus')}
                            >
                              <div className="flex items-center">
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${
                                  playgroundState.securityChecks.antivirus 
                                    ? 'bg-green-500' 
                                    : 'border border-blue-400'
                                }`}>
                                  {playgroundState.securityChecks.antivirus && (
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <span className="text-white">Antivirus</span>
                              </div>
                              
                              <Badge className={playgroundState.securityChecks.antivirus ? 'bg-green-700' : 'bg-blue-700'}>
                                {playgroundState.securityChecks.antivirus ? 'Activé' : 'Désactivé'}
                              </Badge>
                            </div>
                            
                            <div 
                              className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                                playgroundState.securityChecks.backup 
                                  ? 'bg-green-900/30 border border-green-700/50' 
                                  : 'bg-blue-900/30 border border-blue-700/50 hover:bg-blue-900/50'
                              }`}
                              onClick={() => toggleSecurityCheck('backup')}
                            >
                              <div className="flex items-center">
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${
                                  playgroundState.securityChecks.backup 
                                    ? 'bg-green-500' 
                                    : 'border border-blue-400'
                                }`}>
                                  {playgroundState.securityChecks.backup && (
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <span className="text-white">Sauvegarde automatique</span>
                              </div>
                              
                              <Badge className={playgroundState.securityChecks.backup ? 'bg-green-700' : 'bg-blue-700'}>
                                {playgroundState.securityChecks.backup ? 'Activé' : 'Désactivé'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Testeur de mot de passe */}
                        <div>
                          <h4 className="text-blue-300 font-medium mb-3">Vérificateur de mot de passe</h4>
                          
                          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                            <div className="mb-3">
                              <p className="text-sm text-blue-200 mb-2">Entrez un mot de passe pour tester sa sécurité :</p>
                              <Input 
                                type="password" 
                                className="bg-blue-950 border-blue-700 text-white"
                                placeholder="Votre mot de passe" 
                                onChange={(e) => evaluatePassword(e.target.value)}
                              />
                            </div>
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-blue-300">Force du mot de passe</span>
                                <span className={`
                                  ${playgroundState.passwordStrength < 25 ? 'text-red-400' : 
                                    playgroundState.passwordStrength < 50 ? 'text-amber-400' : 
                                    playgroundState.passwordStrength < 75 ? 'text-yellow-400' : 'text-green-400'}
                                `}>
                                  {playgroundState.passwordStrength < 25 ? 'Très faible' : 
                                    playgroundState.passwordStrength < 50 ? 'Faible' : 
                                    playgroundState.passwordStrength < 75 ? 'Moyen' : 'Fort'}
                                </span>
                              </div>
                              <div className="w-full h-2 bg-blue-950 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    playgroundState.passwordStrength < 25 ? 'bg-red-600' : 
                                    playgroundState.passwordStrength < 50 ? 'bg-amber-600' : 
                                    playgroundState.passwordStrength < 75 ? 'bg-yellow-600' : 'bg-green-600'
                                  }`} 
                                  style={{ width: `${playgroundState.passwordStrength}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {playgroundState.passwordStrength > 0 && (
                              <div className="text-sm">
                                <p className="text-blue-200 mb-2">Recommandations :</p>
                                <ul className="space-y-1">
                                  {playgroundState.passwordStrength < 25 && (
                                    <li className="text-red-400">• Votre mot de passe est trop faible et facilement piratable</li>
                                  )}
                                  {playgroundState.passwordStrength >= 75 && (
                                    <li className="text-green-400">• Excellent ! Votre mot de passe est sécurisé</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-900/20 p-5 rounded-lg border border-amber-700/50 mb-6">
                      <h3 className="text-lg font-medium text-white mb-3">État de sécurité du système</h3>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-amber-300">Niveau de sécurité global</span>
                          <span className="text-amber-300">
                            {Object.values(playgroundState.securityChecks).filter(v => v).length * 25}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-amber-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-600 to-amber-500" 
                            style={{ width: `${Object.values(playgroundState.securityChecks).filter(v => v).length * 25}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {Object.values(playgroundState.securityChecks).filter(v => v).length === 0 && (
                          <Alert className="bg-red-900/30 border-red-700/60">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertTitle className="text-red-400">Système vulnérable</AlertTitle>
                            <AlertDescription className="text-red-200">
                              Votre système est extrêmement vulnérable aux attaques. Activez des mesures de sécurité pour le protéger.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {Object.values(playgroundState.securityChecks).filter(v => v).length >= 1 && 
                         Object.values(playgroundState.securityChecks).filter(v => v).length < 4 && (
                          <Alert className="bg-amber-900/30 border-amber-700/60">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <AlertTitle className="text-amber-400">Protection partielle</AlertTitle>
                            <AlertDescription className="text-amber-200">
                              Votre système a quelques protections, mais reste vulnérable. Continuez à améliorer sa sécurité.
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        {Object.values(playgroundState.securityChecks).filter(v => v).length === 4 && (
                          <Alert className="bg-green-900/30 border-green-700/60">
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                            <AlertTitle className="text-green-400">Système sécurisé</AlertTitle>
                            <AlertDescription className="text-green-200">
                              Félicitations ! Votre système est maintenant bien protégé contre les menaces courantes.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <Button 
                        variant="outline" 
                        className="border-amber-600 text-amber-400 hover:bg-amber-900/30"
                        onClick={() => setCurrentStep(3)}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Précédent
                      </Button>
                      
                      <Button 
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white"
                        onClick={() => setCurrentStep(5)}
                        disabled={Object.values(playgroundState.securityChecks).filter(v => v).length < 2}
                      >
                        Suivant
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Étape 5: Conclusion et certificat */}
            {currentStep === 5 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-amber-950/40 border-amber-800/40 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-6">
                      <div className="p-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 h-20 w-20 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">Félicitations !</h2>
                    
                    <p className="text-amber-200 text-center mb-6">
                      Vous avez terminé le module "Premiers pas en cybersécurité" et acquis les connaissances fondamentales pour vous protéger en ligne.
                    </p>
                    
                    <div className="bg-gradient-to-r from-amber-700/20 to-amber-600/20 border border-amber-700/50 rounded-lg p-6 mb-6">
                      <h3 className="text-xl font-semibold text-white mb-4 text-center">Ce que vous avez appris</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-amber-900/30 p-4 rounded-lg text-center">
                          <div className="flex justify-center mb-3">
                            <Eye className="h-8 w-8 text-amber-400" />
                          </div>
                          <h4 className="font-medium text-white mb-2">Identifier les menaces</h4>
                          <p className="text-sm text-amber-200">Reconnaître le phishing et les risques numériques quotidiens</p>
                        </div>
                        
                        <div className="bg-amber-900/30 p-4 rounded-lg text-center">
                          <div className="flex justify-center mb-3">
                            <Lock className="h-8 w-8 text-amber-400" />
                          </div>
                          <h4 className="font-medium text-white mb-2">Créer des défenses</h4>
                          <p className="text-sm text-amber-200">Mettre en place des mots de passe forts et sécuriser vos appareils</p>
                        </div>
                        
                        <div className="bg-amber-900/30 p-4 rounded-lg text-center">
                          <div className="flex justify-center mb-3">
                            <Shield className="h-8 w-8 text-amber-400" />
                          </div>
                          <h4 className="font-medium text-white mb-2">Protéger vos données</h4>
                          <p className="text-sm text-amber-200">Appliquer les bonnes pratiques pour préserver votre vie privée</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg p-6 mb-6">
                      <h3 className="text-xl font-semibold text-blue-300 mb-4">Et maintenant ?</h3>
                      
                      <div className="space-y-4">
                        <div className="flex">
                          <div className="mr-4 p-2 bg-blue-900/50 rounded-full h-10 w-10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Continuez votre formation</h4>
                            <p className="text-blue-200 text-sm">Découvrez nos modules intermédiaires pour approfondir vos connaissances</p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="mr-4 p-2 bg-blue-900/50 rounded-full h-10 w-10 flex items-center justify-center">
                            <HardDrive className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Sécurisez vos appareils</h4>
                            <p className="text-blue-200 text-sm">Appliquez les principes appris pour protéger tous vos appareils personnels</p>
                          </div>
                        </div>
                        
                        <div className="flex">
                          <div className="mr-4 p-2 bg-blue-900/50 rounded-full h-10 w-10 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Partagez vos connaissances</h4>
                            <p className="text-blue-200 text-sm">Sensibilisez vos proches aux bonnes pratiques de cybersécurité</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white px-6 py-6"
                        onClick={() => {
                          setProgress(100);
                          toast({
                            title: "Félicitations !",
                            description: "Module terminé et certificat généré avec succès.",
                          });
                        }}
                      >
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Terminer et obtenir mon certificat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}