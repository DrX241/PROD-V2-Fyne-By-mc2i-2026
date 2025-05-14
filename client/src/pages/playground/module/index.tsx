import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, CheckCircle, Play, X, AlertCircle, Terminal, Code, Heart, ExternalLink, User, LightbulbIcon, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';

// Type pour une carte d'apprentissage
interface LearningCard {
  id: string;
  type: 'explanation' | 'code' | 'quiz' | 'terminal' | 'challenge';
  content: string;
  code?: string;
  options?: string[];
  correctOption?: string;
  hint?: string;
  terminalPrompt?: string;
  expectedCommand?: string;
  terminalResponse?: string;
}

// Type pour un module d'apprentissage
interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: number;
  cards: LearningCard[];
  xp: number;
}

// Données des modules
const modules: { [key: string]: LearningModule } = {
  'cybersecurity-intro': {
    id: 'cybersecurity-intro',
    title: 'Introduction à la Cybersécurité',
    description: 'Les bases de la sécurité informatique pour débutants',
    level: 1,
    xp: 100,
    cards: [
      {
        id: 'card-1',
        type: 'explanation',
        content: 'La cybersécurité est l\'ensemble des techniques pour protéger les systèmes informatiques et les données contre les attaques.'
      },
      {
        id: 'card-2',
        type: 'explanation',
        content: 'La triade CIA constitue les trois piliers fondamentaux de la sécurité : **Confidentialité**, **Intégrité** et **Disponibilité**.'
      },
      {
        id: 'card-3',
        type: 'quiz',
        content: 'Que signifie l\'acronyme CIA en cybersécurité ?',
        options: [
          'Central Intelligence Agency',
          'Confidentialité, Intégrité, Authentification',
          'Confidentialité, Intégrité, Disponibilité (Availability)',
          'Cybersécurité, Internet, Autorisation'
        ],
        correctOption: 'Confidentialité, Intégrité, Disponibilité (Availability)'
      },
      {
        id: 'card-4',
        type: 'explanation',
        content: 'Un mot de passe fort est crucial pour protéger vos comptes. Il doit contenir des majuscules, des minuscules, des chiffres et des caractères spéciaux.'
      },
      {
        id: 'card-5',
        type: 'code',
        content: 'Écrivez une fonction qui vérifie si un mot de passe est assez fort (au moins 8 caractères, au moins une majuscule, un chiffre et un caractère spécial).',
        code: `function isStrongPassword(password) {
  // Complétez cette fonction
  // Elle doit retourner true si le mot de passe est fort
  // et false sinon
  
  return password.length >= 8;
}`,
        hint: 'Utilisez des expressions régulières pour vérifier les caractères (ex: /[A-Z]/.test(password) pour les majuscules)'
      },
      {
        id: 'card-6',
        type: 'terminal',
        content: 'Les professionnels de la cybersécurité utilisent souvent le terminal. Essayez cette commande pour lister tous les fichiers, y compris les cachés :',
        terminalPrompt: 'user@secureshell:~$ ',
        expectedCommand: 'ls -la',
        terminalResponse: `total 32
drwxr-xr-x 4 user user 4096 May 1 10:00 .
drwxr-xr-x 3 root root 4096 May 1 09:58 ..
-rw------- 1 user user  220 May 1 09:58 .bash_history
-rw-r--r-- 1 user user 3526 May 1 09:58 .bashrc
-rw-r--r-- 1 user user  807 May 1 09:58 .profile
-rw-r--r-- 1 user user    0 May 1 09:59 .hidden_file
-rw-r--r-- 1 user user 1024 May 1 09:59 secure_data.txt`
      },
      {
        id: 'card-7',
        type: 'challenge',
        content: 'Scénario : Vous recevez un email avec un lien suspect. Que devriez-vous faire ?',
        options: [
          'Cliquer sur le lien pour voir où il mène',
          'Ne pas cliquer et signaler l\'email comme potentiel phishing',
          'Répondre à l\'expéditeur pour demander plus d\'informations',
          'Transférer l\'email à tous vos collègues pour les avertir'
        ],
        correctOption: 'Ne pas cliquer et signaler l\'email comme potentiel phishing'
      },
      {
        id: 'card-8',
        type: 'explanation',
        content: 'Félicitations ! Vous avez complété l\'introduction à la cybersécurité et appris les concepts fondamentaux pour vous protéger en ligne.'
      }
    ]
  },
  'threat-landscape': {
    id: 'threat-landscape',
    title: 'Panorama des menaces',
    description: 'Découverte des principales cybermenaces actuelles',
    level: 2,
    xp: 150,
    cards: [
      {
        id: 'card-1',
        type: 'explanation',
        content: 'Le paysage des menaces cyber évolue constamment. Les attaquants développent sans cesse de nouvelles techniques.'
      },
      {
        id: 'card-2',
        type: 'explanation',
        content: 'Les ransomwares sont des logiciels malveillants qui chiffrent vos données et exigent une rançon pour les déchiffrer.'
      },
      {
        id: 'card-3',
        type: 'quiz',
        content: 'Quelle est la meilleure défense contre les ransomwares ?',
        options: [
          'Payer la rançon immédiatement',
          'Ignorer l\'attaque',
          'Avoir des sauvegardes régulières et sécurisées',
          'Reformater le système sans précaution'
        ],
        correctOption: 'Avoir des sauvegardes régulières et sécurisées'
      },
      {
        id: 'card-4',
        type: 'challenge',
        content: 'Votre entreprise vient d\'être touchée par un ransomware. Quelle devrait être votre première action ?',
        options: [
          'Payer immédiatement la rançon',
          'Déconnecter les systèmes infectés du réseau',
          'Envoyer un email à tous les employés',
          'Formater tous les ordinateurs'
        ],
        correctOption: 'Déconnecter les systèmes infectés du réseau'
      }
    ]
  }
};

export default function LearningModulePage() {
  const params = useParams();
  const moduleId = params.id || new URLSearchParams(window.location.search).get('id') || 'cybersecurity-intro';
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark' || themeMode === 'futuristic';
  
  // États pour suivre la progression dans le module
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [completedCards, setCompletedCards] = useState<string[]>([]);
  
  // États pour les différents types de cartes
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userCode, setUserCode] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [showTerminalResponse, setShowTerminalResponse] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Charger le module (depuis les exemples statiques ou l'API)
  useEffect(() => {
    const loadModule = async () => {
      // 1. Essayer de charger depuis les modules statiques d'exemple
      if (modules[moduleId]) {
        setCurrentModule(modules[moduleId]);
      } 
      // 2. Sinon, essayer de charger depuis l'API
      else {
        try {
          // Faire une requête à l'API pour récupérer le module personnalisé
          const response = await fetch(`/api/module-generator/modules/${moduleId}`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.module) {
              // Adapter le format du module personnalisé au format attendu
              const customModule: LearningModule = {
                id: data.module.id.toString(),
                title: data.module.name || data.module.iamName,
                description: data.module.description,
                level: data.module.difficulty === 'beginner' ? 1 : data.module.difficulty === 'intermediate' ? 2 : 3,
                xp: 200,
                cards: []
              };
              
              // Extraire les cartes des données moduleData selon la structure
              const moduleData = data.module.moduleData;
              
              if (moduleData) {
                // Ajouter des cartes d'explication pour chaque section
                customModule.cards.push({
                  id: 'intro-card',
                  type: 'explanation',
                  content: moduleData.description || data.module.description
                });
                
                // Ajouter d'autres cartes selon les sections du module
                if (moduleData.seFormer || moduleData.trainerModule) {
                  const trainingContent = moduleData.seFormer || moduleData.trainerModule;
                  customModule.cards.push({
                    id: 'training-card',
                    type: 'explanation',
                    content: `<h3>Formation</h3><p>${trainingContent.content || JSON.stringify(trainingContent)}</p>`
                  });
                }
                
                if (moduleData.sEntrainer || moduleData.opsModule) {
                  const practiceContent = moduleData.sEntrainer || moduleData.opsModule;
                  customModule.cards.push({
                    id: 'practice-card',
                    type: 'explanation',
                    content: `<h3>Pratique</h3><p>${practiceContent.content || JSON.stringify(practiceContent)}</p>`
                  });
                }
                
                if (moduleData.sEvaluer || moduleData.testModule) {
                  const evalContent = moduleData.sEvaluer || moduleData.testModule;
                  customModule.cards.push({
                    id: 'eval-card',
                    type: 'explanation',
                    content: `<h3>Évaluation</h3><p>${evalContent.content || JSON.stringify(evalContent)}</p>`
                  });
                }
                
                if (moduleData.automatiser || moduleData.ascensionModule) {
                  const autoContent = moduleData.automatiser || moduleData.ascensionModule;
                  customModule.cards.push({
                    id: 'auto-card',
                    type: 'explanation',
                    content: `<h3>Automatisation</h3><p>${autoContent.content || JSON.stringify(autoContent)}</p>`
                  });
                }
              }
              
              setCurrentModule(customModule);
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement du module:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger le module personnalisé",
            variant: "destructive"
          });
        }
      }
      
      // Réinitialiser les états si on change de module
      setCurrentCardIndex(0);
      setCompletedCards([]);
      setSelectedOption(null);
      setUserCode('');
      setTerminalInput('');
      setShowTerminalResponse(false);
      setShowHint(false);
      setIsCorrect(null);
    };
    
    loadModule();
  }, [moduleId, toast]);
  
  // Obtenir la carte actuelle
  const currentCard = currentModule?.cards[currentCardIndex];
  
  // Initialiser le code de l'utilisateur
  useEffect(() => {
    if (currentCard && currentCard.type === 'code' && currentCard.code) {
      setUserCode(currentCard.code);
    }
  }, [currentCard]);
  
  // Fonction pour passer à la carte suivante
  const goToNextCard = () => {
    if (!currentModule) return;
    
    if (currentCardIndex < currentModule.cards.length - 1) {
      // Marquer la carte actuelle comme complétée
      if (currentCard && !completedCards.includes(currentCard.id)) {
        setCompletedCards([...completedCards, currentCard.id]);
      }
      
      // Réinitialiser les états
      setSelectedOption(null);
      setIsCorrect(null);
      setShowHint(false);
      setShowTerminalResponse(false);
      
      // Passer à la carte suivante
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Fin du module
      toast({
        title: 'Module terminé !',
        description: `Vous avez gagné ${currentModule.xp} XP en complétant ce module.`,
      });
      
      // Retourner à la page principale du playground
      setTimeout(() => {
        setLocation('/playground');
      }, 2000);
    }
  };
  
  // Fonction pour revenir à la carte précédente
  const goToPreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      // Réinitialiser les états
      setSelectedOption(null);
      setIsCorrect(null);
      setShowHint(false);
      setShowTerminalResponse(false);
    }
  };
  
  // Vérifier la réponse de l'utilisateur
  const checkAnswer = () => {
    if (!currentCard) return;
    
    if (currentCard.type === 'quiz' || currentCard.type === 'challenge') {
      // Vérifier la réponse du quiz
      if (selectedOption === currentCard.correctOption) {
        setIsCorrect(true);
        toast({
          title: 'Correct !',
          description: 'Bonne réponse !',
        });
      } else {
        setIsCorrect(false);
        toast({
          title: 'Incorrect',
          description: 'Ce n\'est pas la bonne réponse, essayez encore.',
          variant: 'destructive',
        });
      }
    } else if (currentCard.type === 'code') {
      // Vérifier le code (simpliste pour la démo)
      const isStrong = userCode.includes('/[A-Z]/.test') && 
                       userCode.includes('/[0-9]/.test') && 
                       userCode.includes('password.length >= 8') &&
                       userCode.includes('/[!@#$%^&*(),.?":{}|<>]/.test');
      
      setIsCorrect(isStrong);
      
      if (isStrong) {
        toast({
          title: 'Excellent !',
          description: 'Votre code vérifie correctement tous les critères d\'un mot de passe fort !',
        });
      } else {
        toast({
          title: 'Pas tout à fait',
          description: 'Votre code ne vérifie pas tous les critères nécessaires.',
          variant: 'destructive',
        });
      }
    } else if (currentCard.type === 'terminal') {
      // Vérifier la commande terminal
      const isCommandCorrect = terminalInput.trim() === currentCard.expectedCommand;
      
      setIsCorrect(isCommandCorrect);
      setShowTerminalResponse(true);
      
      if (isCommandCorrect) {
        toast({
          title: 'Commande correcte !',
          description: 'C\'est la bonne commande !',
        });
      } else {
        toast({
          title: 'Commande incorrecte',
          description: 'Ce n\'est pas la bonne commande, essayez encore.',
          variant: 'destructive',
        });
      }
    }
  };
  
  // Afficher un indice
  const showCardHint = () => {
    setShowHint(true);
    toast({
      title: 'Indice',
      description: currentCard?.hint || 'Aucun indice disponible pour cette carte.',
    });
  };
  
  // Convertir le contenu en HTML
  const renderContent = (content: string) => {
    // Convertir les ** en balises strong
    return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };
  
  // Si le module n'est pas trouvé
  if (!currentModule || !currentCard) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module non trouvé</h1>
          <p className="mb-6">Le module que vous cherchez n'existe pas.</p>
          <Link href="/playground">
            <Button>Retour au Playground</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Calcul de la progression
  const progress = Math.round((completedCards.length / currentModule.cards.length) * 100);
  
  // Animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };
  
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* En-tête */}
      <header className={`py-3 px-4 flex items-center justify-between border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center">
          <Link href="/playground">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">{currentModule.title}</h1>
            <div className="flex items-center text-sm">
              <Badge className={`mr-2 ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                Niveau {currentModule.level}
              </Badge>
              <Progress value={progress} className={`w-32 h-1.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <span className={`ml-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {completedCards.length}/{currentModule.cards.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Badge className={`${isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'} flex items-center`}>
            <Play className="h-3 w-3 mr-1" />
            {currentModule.xp} XP
          </Badge>
          <Button variant="ghost" size="icon">
            <Heart className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </Button>
        </div>
      </header>
      
      {/* Progression des cartes */}
      <div className={`flex justify-center px-4 py-2 ${isDark ? 'bg-gray-800' : 'bg-white border-b border-gray-200'}`}>
        <div className="flex space-x-1 overflow-x-auto max-w-full">
          {currentModule.cards.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-5 rounded-full ${
                index < currentCardIndex
                  ? isDark ? 'bg-green-500' : 'bg-green-500'
                  : index === currentCardIndex
                    ? isDark ? 'bg-blue-500' : 'bg-blue-600'
                    : isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-full rounded-lg overflow-hidden shadow-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* Badge du type de carte */}
            <div className={`px-3 py-1 text-xs font-medium ${
              currentCard.type === 'explanation'
                ? isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                : currentCard.type === 'quiz'
                  ? isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                  : currentCard.type === 'code'
                    ? isDark ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800'
                    : currentCard.type === 'terminal'
                      ? isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                      : isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
            }`}>
              {currentCard.type === 'explanation' && 'Théorie'}
              {currentCard.type === 'quiz' && 'Quiz'}
              {currentCard.type === 'code' && 'Code'}
              {currentCard.type === 'terminal' && 'Terminal'}
              {currentCard.type === 'challenge' && 'Défi'}
            </div>
            
            {/* Contenu de la carte */}
            <div className="p-4">
              {/* Contenu textuel commun à tous les types de cartes */}
              <div 
                className="prose prose-sm max-w-none mb-4"
                dangerouslySetInnerHTML={{ __html: renderContent(currentCard.content) }}
              />
              
              {/* Contenu spécifique selon le type de carte */}
              {currentCard.type === 'quiz' || currentCard.type === 'challenge' ? (
                <div className="space-y-2 mt-4">
                  {currentCard.options?.map((option, index) => (
                    <button
                      key={index}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        selectedOption === option
                          ? isCorrect === null
                            ? isDark ? 'bg-blue-900 border-blue-700 text-white' : 'bg-blue-100 border-blue-300 text-blue-800'
                            : isCorrect
                              ? isDark ? 'bg-green-900 border-green-700 text-white' : 'bg-green-100 border-green-300 text-green-800'
                              : isDark ? 'bg-red-900 border-red-700 text-white' : 'bg-red-100 border-red-300 text-red-800'
                          : isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      } border`}
                      onClick={() => !isCorrect && setSelectedOption(option)}
                      disabled={isCorrect === true}
                    >
                      {option}
                      {selectedOption === option && isCorrect !== null && (
                        <span className="float-right">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : currentCard.type === 'code' ? (
                <div className="mt-4">
                  <div className={`p-4 rounded-md font-mono text-sm mb-4 ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                    <textarea
                      rows={8}
                      className={`w-full bg-transparent resize-none focus:outline-none ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      disabled={isCorrect === true}
                    />
                  </div>
                </div>
              ) : currentCard.type === 'terminal' ? (
                <div className="mt-4">
                  <div className={`p-4 rounded-md font-mono text-sm mb-4 ${isDark ? 'bg-black text-green-400' : 'bg-gray-900 text-green-400'}`}>
                    <div className="mb-2">{currentCard.terminalPrompt}</div>
                    <div className="flex">
                      <input
                        type="text"
                        className={`w-full bg-transparent focus:outline-none ${isDark ? 'text-green-400' : 'text-green-400'}`}
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        disabled={showTerminalResponse && isCorrect === true}
                      />
                    </div>
                    {showTerminalResponse && (
                      <div className="mt-2 whitespace-pre-wrap text-xs">
                        {currentCard.terminalResponse}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              
              {/* Affichage de l'indice */}
              {showHint && currentCard.hint && (
                <div className={`p-3 rounded-md text-sm mt-3 ${isDark ? 'bg-yellow-900/30 text-yellow-200' : 'bg-yellow-50 text-yellow-800'}`}>
                  <div className="flex items-start">
                    <LightbulbIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <p>{currentCard.hint}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Barre d'actions */}
        <div className="flex justify-between w-full max-w-md">
          <Button 
            variant="outline"
            onClick={goToPreviousCard}
            disabled={currentCardIndex === 0}
            className={`${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}`}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          
          <div className="flex space-x-2">
            {(currentCard.type === 'code' || currentCard.type === 'quiz' || currentCard.type === 'challenge' || currentCard.type === 'terminal') && !isCorrect && (
              <>
                {currentCard.hint && (
                  <Button 
                    variant="outline"
                    onClick={showCardHint}
                    className={`${isDark ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : ''}`}
                  >
                    <LightbulbIcon className="h-4 w-4 mr-1" />
                    Indice
                  </Button>
                )}
                <Button
                  onClick={checkAnswer}
                  disabled={
                    (currentCard.type === 'quiz' || currentCard.type === 'challenge') ? !selectedOption :
                    currentCard.type === 'terminal' ? !terminalInput.trim() : false
                  }
                  className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  Vérifier
                </Button>
              </>
            )}
            
            {((currentCard.type === 'explanation') || isCorrect) && (
              <Button 
                onClick={goToNextCard}
                className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                {currentCardIndex === currentModule.cards.length - 1 ? 'Terminer' : 'Continuer'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Astuces de la communauté */}
        {currentCard.type !== 'explanation' && (
          <div className={`w-full max-w-md mt-8 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center mb-2">
              <MessageCircle className={`h-5 w-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className="font-medium">Astuces de la communauté</h3>
            </div>
            <div className="space-y-3">
              <div className={`p-3 rounded-md ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center mb-1">
                  <User className="h-4 w-4 mr-1" />
                  <span className="text-xs font-medium">CyberPro42</span>
                </div>
                <p className="text-sm">
                  {currentCard.type === 'code'
                    ? "N'oubliez pas de vérifier tous les critères un par un pour un mot de passe fort."
                    : currentCard.type === 'terminal'
                      ? "Les commandes Linux sont sensibles à la casse et aux espaces."
                      : "Réfléchissez d'abord aux conséquences de chaque action avant de choisir."}
                </p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <Button variant="link" size="sm">
                Voir plus d'astuces
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}