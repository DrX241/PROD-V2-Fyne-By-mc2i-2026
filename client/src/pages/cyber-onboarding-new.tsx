import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Shield, Shield as ShieldIcon, Database, ListChecks, Activity, Zap, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useChatContext } from "@/contexts/ChatContext";

// Types
interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface PlayerData {
  name: string;
  avatar: string;
  role: string;
  module: string;
  difficulty: string;
  testAnswers: { questionIndex: number; answer: number; correct: boolean }[];
  finalLevel?: string;
  testCompleted: boolean;
}

import { avatars, AvatarSelector, AvatarDisplay } from "@/components/cyber/AvatarCreator";

// Liste de rôles disponibles
const roles = [
  {
    id: "security-analyst",
    name: "Analyste en cybersécurité",
    description: "Expert en détection et analyse des menaces et incidents de sécurité",
    icon: <Shield className="h-5 w-5 text-blue-600" />
  },
  {
    id: "risk-manager",
    name: "Gestionnaire de risques",
    description: "Spécialiste en évaluation et gestion des risques de cybersécurité",
    icon: <Activity className="h-5 w-5 text-emerald-600" />
  },
  {
    id: "incident-responder",
    name: "Répondeur d'incidents",
    description: "Expert en réponse aux incidents et crises de cybersécurité",
    icon: <Zap className="h-5 w-5 text-amber-600" />
  },
  {
    id: "compliance-officer",
    name: "Responsable conformité",
    description: "Spécialiste des normes, réglementations et audits de cybersécurité",
    icon: <ListChecks className="h-5 w-5 text-purple-600" />
  },
];

// Liste de modules disponibles
const modules = [
  {
    id: "crisis",
    name: "Gestion de crise cyber",
    description: "Préparation, gestion et communication lors d'incidents de cybersécurité majeurs",
    icon: <AlertTriangle className="h-5 w-5 text-red-600" />
  },
  {
    id: "gdpr",
    name: "Protection des données personnelles / RGPD",
    description: "Principes et mise en œuvre de la conformité au Règlement Général sur la Protection des Données",
    icon: <Shield className="h-5 w-5 text-green-600" />
  },
  {
    id: "social-engineering",
    name: "Ingénierie sociale et phishing",
    description: "Identification et prévention des techniques de manipulation psychologique",
    icon: <Shield className="h-5 w-5 text-purple-600" />
  },
  {
    id: "incidents",
    name: "Gestion des incidents de sécurité",
    description: "Détection, réponse et analyse des incidents de sécurité informatique",
    icon: <Shield className="h-5 w-5 text-amber-600" />
  },
];

// Niveaux de difficulté
const difficultyLevels = [
  {
    id: "beginner",
    name: "Débutant",
    description: "Pour ceux qui découvrent le domaine de la cybersécurité"
  },
  {
    id: "intermediate",
    name: "Intermédiaire",
    description: "Pour ceux ayant déjà une expérience en cybersécurité"
  },
  {
    id: "expert",
    name: "Expert",
    description: "Pour les professionnels confirmés de la cybersécurité"
  }
];

export default function CyberOnboardingNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setUserName } = useChatContext();
  
  // États du processus d'onboarding
  const [step, setStep] = useState<
    | "name"
    | "avatar" 
    | "role" 
    | "module" 
    | "difficulty" 
    | "test-intro" 
    | "test-questions" 
    | "test-result" 
    | "completed"
  >("name");
  
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "",
    avatar: "",
    role: "",
    module: "",
    difficulty: "",
    testAnswers: [],
    testCompleted: false
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Vérifier si l'utilisateur a déjà complété l'onboarding
  useEffect(() => {
    // Vérifier s'il y a un paramètre reset dans l'URL
    const params = new URLSearchParams(window.location.search);
    const resetParam = params.get('reset');
    
    if (resetParam === 'true') {
      localStorage.removeItem('cyberPlayerData');
      return;
    }
    
    // Vérifier si l'utilisateur a déjà complété l'onboarding
    const savedData = localStorage.getItem('cyberPlayerData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.onboardingComplete) {
        setLocation('/cyber-simulation');
      }
    }
  }, [setLocation]);
  
  // Fonction pour gérer l'entrée du nom
  const handleNameSubmit = (name: string) => {
    if (!name.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer votre nom pour continuer.",
        variant: "destructive"
      });
      return;
    }
    
    setPlayerData({...playerData, name});
    setUserName(name);
    setStep("avatar");
  };
  
  // Fonction pour sélectionner un avatar
  const handleAvatarSelect = (avatarId: string) => {
    setPlayerData({...playerData, avatar: avatarId});
    setStep("role");
  };
  
  // Fonction pour sélectionner un rôle
  const handleRoleSelect = (roleId: string) => {
    setPlayerData({...playerData, role: roleId});
    setStep("module");
  };
  
  // Fonction pour sélectionner un module
  const handleModuleSelect = (moduleId: string) => {
    setPlayerData({...playerData, module: moduleId});
    setStep("difficulty");
  };
  
  // Fonction pour sélectionner un niveau de difficulté
  const handleDifficultySelect = (difficultyId: string) => {
    setPlayerData({...playerData, difficulty: difficultyId});
    setStep("test-intro");
  };
  
  // Fonction pour démarrer le test
  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      // Cartographie des difficulté pour l'API
      const difficultyMap: {[key: string]: string} = {
        'beginner': 'débutant',
        'intermediate': 'intermédiaire',
        'expert': 'expert'
      };
      
      const difficultyLevel = difficultyMap[playerData.difficulty];
      const moduleName = modules.find(m => m.id === playerData.module)?.name || "";
      
      // Appel à l'API pour générer les questions
      const response = await axios.post('/api/cyber/generate-questions', {
        module: moduleName,
        difficulty: difficultyLevel,
        count: 4 // Exactement 4 questions
      });
      
      // Récupérer les questions générées
      setQuestions(response.data.questions);
      setCurrentQuestionIndex(0);
      setStep("test-questions");
    } catch (error) {
      console.error('Erreur lors de la génération des questions:', error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la génération des questions. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour gérer les réponses aux questions
  const handleAnswerQuestion = (answerIndex: number) => {
    // Vérifier si la réponse est correcte
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct;
    
    // Ajouter la réponse aux données du joueur
    const newAnswers = [
      ...playerData.testAnswers,
      { questionIndex: currentQuestionIndex, answer: answerIndex, correct: isCorrect }
    ];
    
    // Mise à jour de l'état avec les nouvelles réponses
    setPlayerData({...playerData, testAnswers: newAnswers});
    
    // Passer à la question suivante ou terminer le test
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Test terminé, calculer le score
      const correctCount = newAnswers.filter(a => a.correct).length;
      const scorePercentage = (correctCount / questions.length) * 100;
      
      // Déterminer le niveau final en fonction du score
      let finalLevel;
      if (playerData.difficulty === 'expert') {
        finalLevel = scorePercentage >= 50 ? "Expert" : "Intermédiaire";
      } else if (playerData.difficulty === 'intermediate') {
        if (scorePercentage >= 75) finalLevel = "Expert";
        else if (scorePercentage >= 40) finalLevel = "Intermédiaire";
        else finalLevel = "Débutant";
      } else {
        finalLevel = scorePercentage >= 75 ? "Intermédiaire" : "Débutant";
      }
      
      // Mettre à jour les données du joueur
      setPlayerData({
        ...playerData, 
        testAnswers: newAnswers,
        finalLevel,
        testCompleted: true
      });
      
      // Passer à l'étape de résultat
      setStep("test-result");
    }
  };
  
  // Fonction pour finaliser l'onboarding et commencer la mission
  const handleCompletedOnboarding = async () => {
    setIsLoading(true);
    try {
      const correctAnswers = playerData.testAnswers.filter(a => a.correct).length;
      const totalQuestions = playerData.testAnswers.length;
      const scorePercentage = (correctAnswers / totalQuestions) * 100;
      
      // Configuration complète du joueur
      const playerConfig = {
        name: playerData.name,
        avatar: playerData.avatar,
        role: playerData.role,
        module: playerData.module,
        selectedDifficulty: playerData.difficulty === 'beginner' 
          ? "Débutant" 
          : playerData.difficulty === 'intermediate' 
            ? "Intermédiaire" 
            : "Expert",
        finalLevel: playerData.finalLevel,
        testResults: {
          score: correctAnswers,
          total: totalQuestions,
          percentage: scorePercentage
        },
        onboardingComplete: true,
        timestamp: Date.now()
      };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('cyberPlayerData', JSON.stringify(playerConfig));
      
      // Envoyer au serveur
      await axios.post('/api/cyber/setup-player', playerConfig);
      
      // Rediriger vers la simulation
      setLocation('/cyber-simulation');
    } catch (error) {
      console.error('Erreur lors de la finalisation de l\'onboarding:', error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la finalisation de votre profil.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">I AM CYBER</h1>
            <p className="text-gray-600">Votre parcours de formation en cybersécurité commence ici</p>
          </div>
          <div className="w-32"></div> {/* Élément vide pour équilibrer la mise en page */}
        </div>
        
        <Card className="flex-grow flex flex-col">
          <CardContent className="p-6 flex-grow flex flex-col">
            {/* Étape 1: Nom */}
            {step === "name" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow flex flex-col justify-center items-center"
              >
                <div className="text-center max-w-md mb-8">
                  <ShieldIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Bienvenue dans I AM CYBER</h2>
                  <p className="text-gray-600 mb-6">Pour commencer, dites-nous comment vous vous appelez</p>
                  
                  <input
                    type="text"
                    placeholder="Votre nom"
                    className="w-full p-3 border rounded-md mb-4"
                    value={playerData.name}
                    onChange={(e) => setPlayerData({...playerData, name: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit(playerData.name)}
                  />
                  
                  <Button 
                    onClick={() => handleNameSubmit(playerData.name)}
                    className="w-full"
                  >
                    Continuer
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Étape 2: Avatar */}
            {step === "avatar" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Choisissez votre avatar</h2>
                  <p className="text-gray-600">Sélectionnez un personnage qui vous représente</p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <AvatarSelector 
                    selectedAvatar={playerData.avatar} 
                    onSelectAvatar={handleAvatarSelect} 
                  />
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => setStep("name")}
                    variant="outline" 
                    className="mr-4"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={() => playerData.avatar && setStep("role")}
                    disabled={!playerData.avatar}
                  >
                    Continuer
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Étape 3: Rôle */}
            {step === "role" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Sélectionnez votre rôle</h2>
                  <p className="text-gray-600">Choisissez un rôle qui vous intéresse pour cette formation</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {roles.map((role) => (
                    <div 
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`cursor-pointer transition-all p-4 border rounded-lg ${
                        playerData.role === role.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{role.icon}</div>
                        <div>
                          <h3 className="font-medium">{role.name}</h3>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => setStep("avatar")}
                    variant="outline" 
                    className="mr-4"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={() => playerData.role && setStep("module")}
                    disabled={!playerData.role}
                  >
                    Continuer
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Étape 4: Module */}
            {step === "module" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Choisissez un module</h2>
                  <p className="text-gray-600">Sélectionnez le domaine de la cybersécurité que vous souhaitez explorer</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {modules.map((module) => (
                    <div 
                      key={module.id}
                      onClick={() => handleModuleSelect(module.id)}
                      className={`cursor-pointer transition-all p-4 border rounded-lg ${
                        playerData.module === module.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{module.icon}</div>
                        <div>
                          <h3 className="font-medium">{module.name}</h3>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => setStep("role")}
                    variant="outline" 
                    className="mr-4"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={() => playerData.module && setStep("difficulty")}
                    disabled={!playerData.module}
                  >
                    Continuer
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Étape 5: Difficulté */}
            {step === "difficulty" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Niveau de difficulté</h2>
                  <p className="text-gray-600">Choisissez le niveau qui correspond le mieux à votre expérience</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {difficultyLevels.map((level) => (
                    <div 
                      key={level.id}
                      onClick={() => handleDifficultySelect(level.id)}
                      className={`cursor-pointer transition-all p-4 border rounded-lg text-center ${
                        playerData.difficulty === level.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-medium">{level.name}</h3>
                      <p className="text-sm text-gray-500">{level.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-8">
                  <Button 
                    onClick={() => setStep("module")}
                    variant="outline" 
                    className="mr-4"
                  >
                    Retour
                  </Button>
                  <Button 
                    onClick={() => playerData.difficulty && setStep("test-intro")}
                    disabled={!playerData.difficulty}
                  >
                    Continuer
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Étape 6: Introduction au test */}
            {step === "test-intro" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow flex flex-col justify-center items-center"
              >
                <div className="text-center max-w-md mb-8">
                  <ShieldIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Évaluez vos connaissances</h2>
                  <p className="text-gray-600 mb-6">
                    Avant de commencer votre formation, nous allons évaluer votre niveau actuel en 
                    {" "}{modules.find(m => m.id === playerData.module)?.name} avec 4 questions.
                  </p>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={() => setStep("difficulty")}
                      variant="outline" 
                      className="mr-4"
                    >
                      Retour
                    </Button>
                    <Button 
                      onClick={handleStartTest}
                      disabled={isLoading}
                    >
                      {isLoading ? "Préparation des questions..." : "Commencer l'évaluation"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Étape 7: Questions du test */}
            {step === "test-questions" && questions.length > 0 && (
              <motion.div 
                key={`question-${currentQuestionIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1}/4</span>
                      <span className="text-sm font-medium text-blue-600">
                        {difficultyLevels.find(d => d.id === playerData.difficulty)?.name}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-6">{questions[currentQuestionIndex].question}</h2>
                    
                    <div className="space-y-3">
                      {questions[currentQuestionIndex].options.map((option, index) => (
                        <div 
                          key={index}
                          onClick={() => handleAnswerQuestion(index)}
                          className="cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition"
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Étape 8: Résultat du test */}
            {step === "test-result" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-grow flex flex-col justify-center items-center"
              >
                <div className="text-center max-w-md mb-8">
                  <ShieldIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Résultats de l'évaluation</h2>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <p className="font-medium mb-2">
                      Score: {playerData.testAnswers.filter(a => a.correct).length}/
                      {playerData.testAnswers.length}
                    </p>
                    <p className="font-medium mb-4">
                      Niveau déterminé: <span className="text-blue-600">{playerData.finalLevel}</span>
                    </p>
                    
                    {playerData.finalLevel === "Expert" && (
                      <p className="text-sm text-gray-700">
                        Félicitations ! Vous avez démontré une excellente compréhension de la {modules.find(m => m.id === playerData.module)?.name}.
                        Vous serez confronté à des scénarios complexes qui mettront vraiment au défi vos compétences.
                      </p>
                    )}
                    
                    {playerData.finalLevel === "Intermédiaire" && (
                      <p className="text-sm text-gray-700">
                        Bravo ! Vous avez démontré une bonne maîtrise des concepts de la {modules.find(m => m.id === playerData.module)?.name}.
                        Vous recevrez des missions avec un bon équilibre entre challenge et accompagnement.
                      </p>
                    )}
                    
                    {playerData.finalLevel === "Débutant" && (
                      <p className="text-sm text-gray-700">
                        Bienvenue dans le monde de la cybersécurité ! Vous faites vos premiers pas dans la {modules.find(m => m.id === playerData.module)?.name}.
                        Vous recevrez des missions adaptées qui vous permettront d'apprendre progressivement.
                      </p>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    Vous allez maintenant être mis en relation avec Isabelle Dubacq, Directrice des Ressources Humaines,
                    qui vous présentera votre premier défi.
                  </p>
                  
                  <Button 
                    onClick={handleCompletedOnboarding}
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Préparation de votre mission..." : "Commencer ma mission"}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}