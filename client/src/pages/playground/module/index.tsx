import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { ArrowLeft, CheckCircle, Code, Send, Coffee, RefreshCw, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useTheme } from '@/contexts/ThemeContext';

// Types pour le module d'apprentissage et ses étapes
interface LearningStep {
  id: string;
  title: string;
  type: 'theory' | 'practice' | 'challenge' | 'quiz';
  content: string;
  codeExample?: string;
  solution?: string;
  options?: string[];
  correctAnswer?: string;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LearningStep[];
  unlocked: boolean;
  completed: boolean;
  progress: number;
  icon: string;
  color: string;
}

// Données factices pour le module (dans une implémentation réelle, cela viendrait d'une API)
const mockModules: { [key: string]: LearningModule } = {
  'cybersecurity-intro': {
    id: 'cybersecurity-intro',
    title: 'Introduction à la Cybersécurité',
    description: 'Comprendre les fondamentaux de la cybersécurité',
    difficulty: 'beginner',
    steps: [
      {
        id: 'what-is-cybersecurity',
        title: 'Qu\'est-ce que la cybersécurité?',
        type: 'theory',
        content: `# Bienvenue dans le monde de la cybersécurité

La cybersécurité est l'ensemble des technologies, processus et pratiques conçus pour protéger les réseaux, les appareils, les programmes et les données contre les attaques, les dommages ou les accès non autorisés.

## Pourquoi est-ce important?

Dans un monde de plus en plus connecté, où les données sont devenues un actif précieux, la cybersécurité est cruciale pour:

- Protéger les informations sensibles
- Préserver la continuité des services
- Maintenir la confiance des utilisateurs
- Respecter les obligations légales et réglementaires

## Les principaux domaines de la cybersécurité

- **Sécurité des applications**: Protection du code et des applications contre les vulnérabilités
- **Sécurité du réseau**: Protection de l'infrastructure réseau contre les intrusions
- **Sécurité des données**: Protection des informations confidentielles
- **Sécurité opérationnelle**: Processus et décisions concernant la gestion des actifs
- **Sécurité des utilisateurs**: Sensibilisation et formation des utilisateurs`
      },
      {
        id: 'threat-actors',
        title: 'Acteurs malveillants',
        type: 'theory',
        content: `# Les acteurs de la menace cybernétique

Les menaces en cybersécurité proviennent de différents acteurs avec des motivations, compétences et ressources variées.

## Types d'acteurs malveillants

### 1. Cybercriminels
- **Motivation**: Principalement financière
- **Méthodes**: Ransomware, fraudes, vols de données
- **Exemples**: Groupes comme Conti, REvil

### 2. Hacktivistes
- **Motivation**: Idéologique ou politique
- **Méthodes**: Défacements de sites, divulgation d'informations
- **Exemples**: Anonymous, LulzSec

### 3. Acteurs étatiques
- **Motivation**: Espionnage, sabotage, avantage géopolitique
- **Méthodes**: Opérations sophistiquées à long terme, APT
- **Exemples**: Unités spécialisées des gouvernements

### 4. Initiés malveillants
- **Motivation**: Vengeance, gain financier, idéologie
- **Méthodes**: Abus de privilèges légitimes
- **Exemples**: Employés mécontents, agents infiltrés

### 5. Script kiddies
- **Motivation**: Reconnaissance, défi personnel
- **Méthodes**: Utilisation d'outils préfabriqués sans compréhension approfondie
- **Caractéristique**: Compétences techniques limitées`
      },
      {
        id: 'security-triad',
        title: 'La triade CIA',
        type: 'practice',
        content: `# La triade CIA: le fondement de la sécurité

La triade CIA est un modèle de sécurité qui se concentre sur trois aspects fondamentaux de la sécurité de l'information.

Chaque mesure de sécurité mise en place vise à protéger un ou plusieurs de ces aspects.

## Exercice pratique

Complétez le code ci-dessous pour identifier les trois piliers de la sécurité de l'information selon la triade CIA:`,
        codeExample: `// Complétez les trois piliers de la sécurité
const securityPillars = [
  "Confidentialité",
  "???",
  "???"
];

// Expliquez brièvement chaque pilier
function explainPillar(pillar) {
  switch(pillar) {
    case "Confidentialité":
      return "Protection contre l'accès non autorisé aux informations";
    case "Intégrité":
      return "???";
    case "Disponibilité":
      return "???";
    default:
      return "Pilier non reconnu";
  }
}`,
        solution: `// Complétez les trois piliers de la sécurité
const securityPillars = [
  "Confidentialité",
  "Intégrité",
  "Disponibilité"
];

// Expliquez brièvement chaque pilier
function explainPillar(pillar) {
  switch(pillar) {
    case "Confidentialité":
      return "Protection contre l'accès non autorisé aux informations";
    case "Intégrité":
      return "Garantie que les données n'ont pas été modifiées de façon non autorisée";
    case "Disponibilité":
      return "Assurance que les systèmes et données sont accessibles quand nécessaire";
    default:
      return "Pilier non reconnu";
  }
}`
      },
      {
        id: 'security-quiz',
        title: 'Quiz de base',
        type: 'quiz',
        content: 'Testons vos connaissances sur les concepts fondamentaux de la cybersécurité:',
        options: [
          'Attaque par déni de service (DoS)',
          'Phishing',
          'Compression quantique',
          'Injection SQL'
        ],
        correctAnswer: 'Compression quantique'
      }
    ],
    unlocked: true,
    completed: false,
    progress: 25,
    icon: '🔐',
    color: 'blue',
  },
  'threat-landscape': {
    id: 'threat-landscape',
    title: 'Paysage des Menaces',
    description: 'Comprendre les différentes menaces cybernétiques actuelles',
    difficulty: 'beginner',
    steps: [
      {
        id: 'common-threats',
        title: 'Menaces courantes',
        type: 'theory',
        content: `# Les menaces cybernétiques courantes

Dans le paysage de la cybersécurité moderne, plusieurs types de menaces prédominent.

## Malwares
Les logiciels malveillants comprennent:
- **Virus**: Se propagent en s'attachant à d'autres programmes
- **Vers**: Se propagent de manière autonome à travers les réseaux
- **Chevaux de Troie**: Apparaissent légitimes mais contiennent du code malveillant
- **Ransomware**: Chiffrent les données et demandent une rançon
- **Spyware**: Collectent des informations à l'insu de l'utilisateur

## Attaques d'ingénierie sociale
- **Phishing**: Emails frauduleux imitant des entités légitimes
- **Spear phishing**: Phishing ciblant spécifiquement certains individus
- **Vishing**: Phishing par téléphone
- **Smishing**: Phishing par SMS
- **Whaling**: Ciblage de cadres supérieurs ou de personnalités importantes

## Attaques basées sur le réseau
- **Déni de service (DoS/DDoS)**: Surchargent les systèmes pour les rendre indisponibles
- **Man-in-the-Middle**: Interception de communications
- **Sniffing**: Capture de trafic réseau
- **DNS spoofing**: Redirection de trafic via DNS falsifié

## Exploitation de vulnérabilités
- **Injection SQL**: Insertion de code SQL malveillant dans des requêtes
- **Cross-Site Scripting (XSS)**: Injection de scripts dans des sites web
- **Exploitation de failles zero-day**: Attaques exploitant des vulnérabilités inconnues`
      },
      {
        id: 'attack-vectors',
        title: 'Vecteurs d\'attaque',
        type: 'theory',
        content: '...'
      }
    ],
    unlocked: true,
    completed: false,
    progress: 0,
    icon: '🌐',
    color: 'red',
  }
};

// Composant principal pour afficher un module
export default function ModuleDetailPage() {
  const params = useParams();
  const moduleId = params.id || new URLSearchParams(window.location.search).get('id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';

  // État pour le module et l'étape actuelle
  const [module, setModule] = useState<LearningModule | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [userCode, setUserCode] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Charger les données du module (en utilisant un ID par défaut si aucun n'est fourni)
  useEffect(() => {
    const id = moduleId || 'cybersecurity-intro';
    if (mockModules[id]) {
      setModule(mockModules[id]);
      
      // Initialiser le code utilisateur si c'est une étape de pratique
      const firstStep = mockModules[id].steps[0];
      if (firstStep && firstStep.type === 'practice' && firstStep.codeExample) {
        setUserCode(firstStep.codeExample);
      }
    }
  }, [moduleId]);
  
  // Obtenir l'étape actuelle
  const currentStep = module?.steps[currentStepIndex] || null;
  
  // Gérer la navigation entre les étapes
  const goToNextStep = () => {
    if (module && currentStepIndex < module.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      
      // Initialiser le code utilisateur pour l'étape suivante si c'est une étape de pratique
      const nextStep = module.steps[currentStepIndex + 1];
      if (nextStep.type === 'practice' && nextStep.codeExample) {
        setUserCode(nextStep.codeExample);
      }
      
      setHasSubmitted(false);
      setSelectedAnswer(null);
    } else {
      // Dernière étape, marquer le module comme terminé
      toast({
        title: "Module terminé!",
        description: "Félicitations! Vous avez terminé ce module d'apprentissage.",
      });
      
      // Rediriger vers la page du playground
      setLocation("/playground");
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      
      // Initialiser le code utilisateur pour l'étape précédente si c'est une étape de pratique
      const prevStep = module?.steps[currentStepIndex - 1];
      if (prevStep?.type === 'practice' && prevStep.codeExample) {
        setUserCode(prevStep.codeExample);
      }
      
      setHasSubmitted(false);
      setSelectedAnswer(null);
    }
  };
  
  // Vérifier le code de l'utilisateur
  const checkPracticeCode = () => {
    if (!currentStep || !currentStep.solution) return;
    
    // Simplification pour la démo - vérifier si le code contient les mots clés
    const isCorrect = userCode.includes('Intégrité') && userCode.includes('Disponibilité');
    setIsCorrect(isCorrect);
    setHasSubmitted(true);
    
    if (isCorrect) {
      // Marquer l'étape comme terminée
      if (!completedSteps.includes(currentStep.id)) {
        setCompletedSteps([...completedSteps, currentStep.id]);
      }
      
      toast({
        title: "Bravo!",
        description: "Votre solution est correcte.",
      });
    } else {
      toast({
        title: "Pas tout à fait...",
        description: "Votre solution n'est pas correcte. Essayez encore!",
        variant: "destructive"
      });
    }
  };
  
  // Vérifier la réponse du quiz
  const checkQuizAnswer = () => {
    if (!currentStep || !selectedAnswer) return;
    
    const isCorrect = selectedAnswer === currentStep.correctAnswer;
    setIsCorrect(isCorrect);
    setHasSubmitted(true);
    
    if (isCorrect) {
      // Marquer l'étape comme terminée
      if (!completedSteps.includes(currentStep.id)) {
        setCompletedSteps([...completedSteps, currentStep.id]);
      }
      
      toast({
        title: "Bonne réponse!",
        description: "Vous avez choisi la bonne réponse.",
      });
    } else {
      toast({
        title: "Mauvaise réponse",
        description: `La réponse correcte était: ${currentStep.correctAnswer}`,
        variant: "destructive"
      });
    }
  };
  
  // Afficher la solution
  const showSolution = () => {
    if (!currentStep || !currentStep.solution) return;
    
    setUserCode(currentStep.solution);
    toast({
      title: "Solution affichée",
      description: "Voici la solution à l'exercice.",
    });
  };
  
  // Si le module n'est pas trouvé
  if (!module) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isFuturistic ? 'bg-gradient-to-b from-gray-950 to-blue-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Module non trouvé</h1>
          <p className="mb-6">Le module que vous recherchez n'existe pas ou n'est pas disponible.</p>
          <Link href="/playground">
            <Button>Retour au Playground</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Calcul de la progression
  const progress = (completedSteps.length / module.steps.length) * 100;
  
  return (
    <div className={`min-h-screen ${isFuturistic ? 'bg-gradient-to-b from-gray-950 to-blue-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* En-tête */}
      <header className={`${isFuturistic ? 'bg-gray-900/70 backdrop-blur-md border-b border-blue-900/50' : 'bg-white shadow-sm'} sticky top-0 z-30`}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/playground">
              <Button variant="ghost" size="icon">
                <ArrowLeft className={isFuturistic ? 'text-white' : 'text-gray-700'} />
              </Button>
            </Link>
            <div>
              <h1 className={`text-lg font-bold ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
                {module.title}
              </h1>
              <div className="flex items-center text-sm">
                <span className={`${isFuturistic ? 'text-gray-400' : 'text-gray-500'} mr-2`}>
                  Progression: {Math.round(progress)}%
                </span>
                <Progress value={progress} className={`w-32 h-1.5 ${isFuturistic ? 'bg-gray-800' : 'bg-gray-200'}`} />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <HelpCircle className={isFuturistic ? 'text-white' : 'text-gray-700'} />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Corps principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Progression des étapes */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto py-2">
            {module.steps.map((step, index) => (
              <button
                key={step.id}
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  completedSteps.includes(step.id)
                    ? isFuturistic ? 'bg-green-700 text-white' : 'bg-green-600 text-white'
                    : index === currentStepIndex
                      ? isFuturistic ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
                      : isFuturistic ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'
                } transition-colors duration-200`}
                onClick={() => setCurrentStepIndex(index)}
              >
                {completedSteps.includes(step.id) ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Contenu de l'étape actuelle */}
        {currentStep && (
          <div className="mb-8">
            <div className={`${isFuturistic ? 'bg-gray-900/70 backdrop-blur-md border border-blue-900/50' : 'bg-white border border-gray-200'} rounded-xl p-6 mb-4`}>
              <h2 className={`text-2xl font-bold mb-6 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                {currentStep.title}
              </h2>
              
              {/* Contenu selon le type d'étape */}
              {currentStep.type === 'theory' && (
                <div className={`prose ${isFuturistic ? 'prose-invert' : ''} max-w-none`}>
                  {/* Afficher le contenu formaté en markdown */}
                  <div dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br/>') }} />
                </div>
              )}
              
              {currentStep.type === 'practice' && (
                <div>
                  <div className={`prose ${isFuturistic ? 'prose-invert' : ''} max-w-none mb-6`}>
                    <div dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\n/g, '<br/>') }} />
                  </div>
                  
                  <Tabs defaultValue="code" className="w-full">
                    <TabsList className={`${isFuturistic ? 'bg-gray-800' : 'bg-gray-100'} mb-4`}>
                      <TabsTrigger value="code">Code</TabsTrigger>
                      <TabsTrigger value="preview">Résultat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="code">
                      <div className={`${isFuturistic ? 'bg-gray-950 text-gray-300' : 'bg-gray-50 text-gray-800'} p-4 rounded-md font-mono text-sm mb-4 h-64 overflow-y-auto`}>
                        <textarea
                          className={`w-full h-full bg-transparent resize-none focus:outline-none`}
                          value={userCode}
                          onChange={(e) => setUserCode(e.target.value)}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="preview">
                      <div className={`${isFuturistic ? 'bg-gray-950 text-gray-300' : 'bg-gray-50 text-gray-800'} p-4 rounded-md font-mono text-sm mb-4 h-64 overflow-y-auto`}>
                        {/* Ici on pourrait afficher un résultat interprété du code */}
                        <pre>{userCode}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button onClick={checkPracticeCode} disabled={hasSubmitted && isCorrect} className={isFuturistic ? 'bg-blue-700 hover:bg-blue-600' : ''}>
                      <Send className="w-4 h-4 mr-2" />
                      Vérifier la solution
                    </Button>
                    <Button variant="outline" onClick={showSolution} className={isFuturistic ? 'border-blue-700 text-blue-300' : ''}>
                      <Coffee className="w-4 h-4 mr-2" />
                      Voir la solution
                    </Button>
                    <Button variant="outline" onClick={() => setUserCode(currentStep.codeExample || '')} className={isFuturistic ? 'border-blue-700 text-blue-300' : ''}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              )}
              
              {currentStep.type === 'quiz' && (
                <div>
                  <p className={`text-lg mb-4 ${isFuturistic ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentStep.content}
                  </p>
                  
                  <p className={`font-bold mb-2 ${isFuturistic ? 'text-blue-300' : 'text-blue-700'}`}>
                    Lequel des éléments suivants n'est PAS un type courant de cyberattaque?
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {currentStep.options?.map((option) => (
                      <button
                        key={option}
                        className={`w-full text-left p-4 rounded-md border ${
                          selectedAnswer === option
                            ? hasSubmitted
                              ? isCorrect
                                ? isFuturistic ? 'bg-green-900/50 border-green-500 text-green-200' : 'bg-green-100 border-green-500 text-green-800'
                                : isFuturistic ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-red-100 border-red-500 text-red-800'
                              : isFuturistic ? 'bg-blue-900/30 border-blue-500 text-blue-100' : 'bg-blue-100 border-blue-500 text-blue-800'
                            : isFuturistic ? 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                        } transition-colors duration-200`}
                        onClick={() => !hasSubmitted && setSelectedAnswer(option)}
                        disabled={hasSubmitted}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={checkQuizAnswer} 
                    disabled={!selectedAnswer || (hasSubmitted && isCorrect)}
                    className={isFuturistic ? 'bg-blue-700 hover:bg-blue-600' : ''}
                  >
                    Vérifier la réponse
                  </Button>
                </div>
              )}
            </div>
            
            {/* Navigation entre les étapes */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={goToPreviousStep} 
                disabled={currentStepIndex === 0}
                className={isFuturistic ? 'border-blue-700 text-blue-300' : ''}
              >
                Précédent
              </Button>
              <Button 
                onClick={goToNextStep} 
                disabled={currentStep.type !== 'theory' && !(hasSubmitted && isCorrect)}
                className={isFuturistic ? 'bg-blue-700 hover:bg-blue-600' : ''}
              >
                {currentStepIndex < module.steps.length - 1 ? 'Suivant' : 'Terminer'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}