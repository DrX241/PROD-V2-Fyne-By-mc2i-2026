import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, MailQuestion, KeyRound, Database, Smartphone, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// Définition des types pour nos contenus d'apprentissage
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ScenarioStep {
  description: string;
  options: string[];
  correctOption: number;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

interface LearningLevel {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  learningObjectives: string[];
  scenario: {
    title: string;
    context: string;
    steps: ScenarioStep[];
  };
  quiz: QuizQuestion[];
  resources: {
    title: string;
    source: string;
    url: string;
  }[];
}

// Composant pour un niveau d'apprentissage interactif
const InteractiveLearningLevel: React.FC<{
  level: LearningLevel;
  isDark: boolean;
  onComplete: () => void;
}> = ({ level, isDark, onComplete }) => {
  const [activeTab, setActiveTab] = useState("introduction");
  const [currentScenarioStep, setCurrentScenarioStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [scenarioFeedback, setScenarioFeedback] = useState<string | null>(null);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(Array(level.quiz.length).fill(null));
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  const handleScenarioOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    const isCorrect = optionIndex === level.scenario.steps[currentScenarioStep].correctOption;
    setScenarioFeedback(
      isCorrect 
        ? level.scenario.steps[currentScenarioStep].feedback.correct
        : level.scenario.steps[currentScenarioStep].feedback.incorrect
    );
    
    if (isCorrect && currentScenarioStep < level.scenario.steps.length - 1) {
      setTimeout(() => {
        setCurrentScenarioStep(prev => prev + 1);
        setSelectedOption(null);
        setScenarioFeedback(null);
      }, 1500);
    } else if (isCorrect) {
      setTimeout(() => {
        setScenarioComplete(true);
      }, 1500);
    }
  };
  
  const handleQuizAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = answerIndex;
    setQuizAnswers(newAnswers);
  };
  
  const goToNextQuestion = () => {
    if (currentQuizQuestion < level.quiz.length - 1) {
      setCurrentQuizQuestion(prev => prev + 1);
    } else {
      // Calculer le score final
      let score = 0;
      quizAnswers.forEach((answer, index) => {
        if (answer === level.quiz[index].correctAnswer) {
          score++;
        }
      });
      setQuizScore(Math.round((score / level.quiz.length) * 100));
      setQuizComplete(true);
    }
  };
  
  const isQuizQuestionAnswered = quizAnswers[currentQuizQuestion] !== null;
  
  return (
    <Card className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white'} mb-8`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {level.icon}
          <CardTitle className={`text-xl ${isDark ? 'text-white' : 'text-blue-800'}`}>{level.title}</CardTitle>
        </div>
        <CardDescription className={isDark ? 'text-slate-300' : 'text-slate-600'}>
          {level.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="introduction">Introduction</TabsTrigger>
            <TabsTrigger value="scenario">Scénario</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>
          
          <TabsContent value="introduction">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-blue-50/50'} mb-6`}>
              <h3 className={`font-medium text-lg mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Objectifs d'apprentissage</h3>
              <ul className="list-disc pl-5 space-y-1">
                {level.learningObjectives.map((objective, index) => (
                  <li key={index} className={isDark ? 'text-slate-200' : 'text-slate-700'}>{objective}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className={`font-medium text-lg mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>Ressources officielles</h3>
              <div className="space-y-3">
                {level.resources.map((resource, index) => (
                  <div key={index} className={`p-3 rounded border ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}`}>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{resource.title}</h4>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Source: {resource.source}</p>
                    <a 
                      href={resource.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      Consulter la ressource →
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Button
                onClick={() => setActiveTab("scenario")}
                className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                Commencer le scénario interactif
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="scenario">
            {!scenarioComplete ? (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-blue-50/50'} mb-6`}>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-blue-800'}`}>{level.scenario.title}</h3>
                
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{level.scenario.context}</p>
                
                <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-slate-600/70' : 'bg-white border border-slate-200'}`}>
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Étape {currentScenarioStep + 1} sur {level.scenario.steps.length}
                  </h4>
                  <p className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {level.scenario.steps[currentScenarioStep].description}
                  </p>
                </div>
                
                <div className="space-y-3 mb-4">
                  {level.scenario.steps[currentScenarioStep].options.map((option, index) => (
                    <div 
                      key={index}
                      onClick={() => selectedOption === null && handleScenarioOptionSelect(index)}
                      className={`p-3 rounded-lg cursor-pointer border transition-colors
                        ${selectedOption === index 
                          ? selectedOption === level.scenario.steps[currentScenarioStep].correctOption
                            ? isDark ? 'bg-green-900/50 border-green-700' : 'bg-green-100 border-green-400'
                            : isDark ? 'bg-red-900/50 border-red-700' : 'bg-red-100 border-red-400'
                          : isDark ? 'border-slate-600 hover:border-blue-500 bg-slate-700/30' : 'border-slate-200 hover:border-blue-500 bg-slate-50'
                        }
                      `}
                    >
                      <p className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                        {option}
                      </p>
                    </div>
                  ))}
                </div>
                
                {scenarioFeedback && (
                  <div className={`p-3 rounded-lg ${
                    selectedOption === level.scenario.steps[currentScenarioStep].correctOption
                      ? isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                      : isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`
                      ${selectedOption === level.scenario.steps[currentScenarioStep].correctOption
                        ? isDark ? 'text-green-300' : 'text-green-700'
                        : isDark ? 'text-red-300' : 'text-red-700'
                      }
                    `}>
                      {scenarioFeedback}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border mb-6`}>
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-green-700' : 'bg-green-500'}`}>
                      <span className={`text-xl font-bold ${isDark ? 'text-green-300' : 'text-white'}`}>✓</span>
                    </div>
                  </div>
                </div>
                <h3 className={`text-center font-bold text-lg mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  Scénario terminé avec succès !
                </h3>
                <p className={`text-center mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Vous avez terminé ce scénario interactif. Vous avez démontré votre capacité à prendre les bonnes décisions en matière de cybersécurité.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={() => setActiveTab("quiz")}
                    className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    Passer au quiz
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="quiz">
            {!quizComplete ? (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-blue-50/50'} mb-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-blue-800'}`}>Quiz d'évaluation</h3>
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Question {currentQuizQuestion + 1} sur {level.quiz.length}
                  </span>
                </div>
                
                <Progress value={(currentQuizQuestion / level.quiz.length) * 100} className="mb-6" />
                
                <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-slate-600/70' : 'bg-white border border-slate-200'}`}>
                  <h4 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {level.quiz[currentQuizQuestion].question}
                  </h4>
                  
                  <RadioGroup 
                    value={quizAnswers[currentQuizQuestion]?.toString() || ""}
                    className="space-y-3"
                  >
                    {level.quiz[currentQuizQuestion].options.map((option, index) => (
                      <div 
                        key={index}
                        className={`flex items-center space-x-2 p-3 rounded-lg border
                          ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-200 bg-slate-50'}
                        `}
                      >
                        <RadioGroupItem 
                          value={index.toString()} 
                          id={`option-${index}`} 
                          onClick={() => handleQuizAnswerSelect(currentQuizQuestion, index)}
                        />
                        <Label 
                          htmlFor={`option-${index}`}
                          className={`flex-grow cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {isQuizQuestionAnswered && (
                  <div className="mt-4">
                    <div className={`p-3 rounded-lg mb-4 ${
                      quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer
                        ? isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                        : isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-medium mb-1 ${
                        quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer
                          ? isDark ? 'text-green-300' : 'text-green-700'
                          : isDark ? 'text-red-300' : 'text-red-700'
                      }`}>
                        {quizAnswers[currentQuizQuestion] === level.quiz[currentQuizQuestion].correctAnswer 
                          ? "Bonne réponse !" 
                          : "Réponse incorrecte"}
                      </p>
                      <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {level.quiz[currentQuizQuestion].explanation}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={goToNextQuestion}
                      className={`w-full ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {currentQuizQuestion < level.quiz.length - 1 ? "Question suivante" : "Terminer le quiz"}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-5 rounded-lg ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border mb-6`}>
                <div className="flex justify-center mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-green-700' : 'bg-green-500'}`}>
                      <span className={`text-xl font-bold ${isDark ? 'text-green-300' : 'text-white'}`}>✓</span>
                    </div>
                  </div>
                </div>
                <h3 className={`text-center font-bold text-lg mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  Quiz terminé !
                </h3>
                <div className="flex justify-center mb-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    quizScore >= 80 
                      ? isDark ? 'bg-green-900/30' : 'bg-green-100' 
                      : quizScore >= 50 
                        ? isDark ? 'bg-amber-900/30' : 'bg-amber-100'
                        : isDark ? 'bg-red-900/30' : 'bg-red-100'
                  }`}>
                    <span className={`text-2xl font-bold ${
                      quizScore >= 80 
                        ? isDark ? 'text-green-300' : 'text-green-700' 
                        : quizScore >= 50 
                          ? isDark ? 'text-amber-300' : 'text-amber-700'
                          : isDark ? 'text-red-300' : 'text-red-700'
                    }`}>
                      {quizScore}%
                    </span>
                  </div>
                </div>
                
                <p className={`text-center mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {quizScore >= 80 
                    ? "Excellent ! Vous maîtrisez très bien ce sujet."
                    : quizScore >= 50 
                      ? "Bon travail ! Vous avez une bonne compréhension du sujet, mais il y a encore place à l'amélioration."
                      : "Vous pourriez bénéficier d'une révision supplémentaire sur ce sujet."}
                </p>
                
                <div className="flex justify-center">
                  <Button
                    onClick={onComplete}
                    className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    Terminer ce niveau
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Données pour les niveaux d'apprentissage
const phishingLevel: LearningLevel = {
  id: "phishing",
  title: "Reconnaître et éviter le phishing",
  icon: <MailQuestion className="h-5 w-5 text-blue-500" />,
  description: "Apprenez à identifier et à vous protéger contre les tentatives de phishing qui peuvent compromettre vos informations sensibles.",
  learningObjectives: [
    "Identifier les caractéristiques communes des emails de phishing",
    "Comprendre les techniques utilisées par les cybercriminels pour créer des emails convaincants",
    "Apprendre les bonnes pratiques pour vérifier l'authenticité des communications",
    "Savoir quoi faire en cas de tentative de phishing détectée"
  ],
  scenario: {
    title: "Un email suspect",
    context: "Vous êtes responsable informatique chez mc2i. Un lundi matin, vous recevez un email qui semble provenir de votre banque d'entreprise vous demandant de mettre à jour vos informations de sécurité suite à une prétendue tentative de fraude.",
    steps: [
      {
        description: "L'email contient un lien vers un site Web qui ressemble au site officiel de votre banque, mais l'URL est légèrement différente (banque-enterprise-securite.com au lieu de banque-entreprise.fr). Que faites-vous ?",
        options: [
          "Cliquer sur le lien pour vérifier s'il s'agit bien du site de votre banque",
          "Ignorer l'email et le supprimer immédiatement",
          "Contacter directement votre banque par téléphone pour vérifier la légitimité de l'email",
          "Transférer l'email à vos collègues pour leur demander leur avis"
        ],
        correctOption: 2,
        feedback: {
          correct: "Excellente décision ! Contacter directement votre banque par un canal sécurisé est la meilleure approche. Ne jamais faire confiance aux liens contenus dans des emails suspects.",
          incorrect: "Attention ! Cette action pourrait vous exposer à un risque. Lorsque vous recevez un email suspect, contactez toujours l'organisation concernée par un canal officiel que vous connaissez (numéro de téléphone officiel ou en vous rendant directement sur leur site web en tapant l'URL)."
        }
      },
      {
        description: "Votre banque confirme qu'ils n'ont envoyé aucun email de ce type. Que devriez-vous faire maintenant ?",
        options: [
          "Supprimer simplement l'email et oublier l'incident",
          "Signaler l'email comme phishing à votre équipe de sécurité informatique et à la banque",
          "Répondre à l'email pour leur dire que vous savez qu'il s'agit d'une tentative de phishing",
          "Cliquer sur le lien pour voir à quoi ressemble la fausse page par curiosité"
        ],
        correctOption: 1,
        feedback: {
          correct: "Très bien ! Signaler l'incident à votre équipe de sécurité informatique et à la banque est crucial pour aider à protéger d'autres personnes et permettre aux équipes de sécurité de prendre des mesures contre ces tentatives.",
          incorrect: "Cette approche n'est pas optimale. Il est important de signaler les tentatives de phishing pour aider à protéger d'autres personnes et permettre aux équipes de sécurité de prendre des mesures."
        }
      },
      {
        description: "Suite à cet incident, vous souhaitez sensibiliser vos collègues aux risques de phishing. Quelle serait la meilleure approche ?",
        options: [
          "Envoyer un email à tous les employés avec le faux email en pièce jointe pour qu'ils puissent voir à quoi ressemble une tentative de phishing",
          "Organiser une session de sensibilisation avec des exemples concrets et des conseils pratiques",
          "Installer un filtre anti-phishing sans informer les employés, car la technologie est suffisante",
          "Demander à tous les employés de changer leurs mots de passe immédiatement"
        ],
        correctOption: 1,
        feedback: {
          correct: "Parfait ! Une formation de sensibilisation est essentielle. Combiner la technologie avec l'éducation des utilisateurs est la meilleure protection contre le phishing.",
          incorrect: "Cette approche n'est pas la plus efficace. La sensibilisation des utilisateurs est un élément clé de la défense contre le phishing, et elle doit être faite de manière structurée avec des exemples sécurisés."
        }
      }
    ]
  },
  quiz: [
    {
      question: "Quel est l'un des indices les plus courants d'un email de phishing ?",
      options: [
        "L'email est envoyé pendant les heures de bureau",
        "L'email contient des fautes d'orthographe ou de grammaire",
        "L'email inclut le logo officiel de l'entreprise",
        "L'email est adressé à vous par votre nom"
      ],
      correctAnswer: 1,
      explanation: "Les emails de phishing contiennent souvent des erreurs de grammaire, d'orthographe ou de mise en page. Les communications officielles des entreprises sont généralement bien rédigées et sans erreurs évidentes."
    },
    {
      question: "Quelle est la meilleure façon de vérifier si un lien dans un email est légitime ?",
      options: [
        "Cliquer sur le lien pour voir où il mène",
        "Regarder l'URL en survolant le lien sans cliquer dessus",
        "Vérifier si l'email contient le logo officiel de l'entreprise",
        "Demander à un collègue de cliquer sur le lien pour vous"
      ],
      correctAnswer: 1,
      explanation: "Survoler un lien sans cliquer dessus vous permet de voir l'URL réelle dans votre client email. Recherchez des erreurs d'orthographe dans le nom de domaine ou des domaines inhabituels (.xyz au lieu de .fr ou .com)."
    },
    {
      question: "Que faire si vous avez cliqué sur un lien suspect et saisi vos identifiants ?",
      options: [
        "Attendre et voir si quelque chose de suspect se produit",
        "Éteindre votre ordinateur immédiatement",
        "Changer vos mots de passe immédiatement et signaler l'incident",
        "Formater votre ordinateur"
      ],
      correctAnswer: 2,
      explanation: "Si vous pensez avoir été victime d'une attaque de phishing, changez immédiatement vos mots de passe pour limiter les dégâts et signalez l'incident à votre service informatique. Plus vous agissez rapidement, plus vous limitez les risques."
    }
  ],
  resources: [
    {
      title: "Guide de l'ANSSI sur la détection du phishing",
      source: "ANSSI",
      url: "https://www.ssi.gouv.fr/guide/detection-du-phishing/"
    },
    {
      title: "Fiche pratique CNIL : Se protéger des attaques de phishing",
      source: "CNIL",
      url: "https://www.cnil.fr/fr/les-conseils-de-la-cnil-pour-eviter-les-arnaques-au-faux-support-technique"
    }
  ]
};

const passwordLevel: LearningLevel = {
  id: "passwords",
  title: "Gestion sécurisée des mots de passe",
  icon: <KeyRound className="h-5 w-5 text-purple-500" />,
  description: "Découvrez les meilleures pratiques pour créer et gérer des mots de passe forts qui protégeront efficacement vos comptes.",
  learningObjectives: [
    "Comprendre les caractéristiques d'un mot de passe fort",
    "Apprendre à créer et mémoriser des mots de passe complexes",
    "Découvrir les avantages des gestionnaires de mots de passe",
    "Comprendre l'importance de l'authentification à deux facteurs"
  ],
  scenario: {
    title: "Renforcement de la politique de mots de passe",
    context: "En tant que consultant, vous êtes chargé d'améliorer la politique de mots de passe de votre client qui a récemment subi une violation de données. Vous devez prendre des décisions pour renforcer la sécurité tout en maintenant une bonne expérience utilisateur.",
    steps: [
      {
        description: "Quelle politique de mots de passe recommanderiez-vous ?",
        options: [
          "Mots de passe de 6 caractères minimum, changés tous les mois",
          "Mots de passe de 12 caractères minimum avec une combinaison de lettres, chiffres et caractères spéciaux, changés uniquement en cas de suspicion de compromission",
          "Phrases de passe de 16 caractères minimum, sans exigence de caractères spéciaux, changées tous les 3 mois",
          "Mots de passe de 8 caractères avec des exigences complexes, changés toutes les semaines"
        ],
        correctOption: 1,
        feedback: {
          correct: "Excellent choix ! Les recherches actuelles montrent que les mots de passe longs et complexes qui ne sont pas changés fréquemment sans raison sont plus sécurisés, car les utilisateurs sont moins susceptibles de choisir des mots de passe faibles ou de les noter.",
          incorrect: "Cette politique présente des inconvénients. Les changements fréquents forcés de mots de passe conduisent souvent les utilisateurs à choisir des mots de passe plus faibles ou à faire des modifications mineures prévisibles."
        }
      },
      {
        description: "Pour améliorer davantage la sécurité, quelle mesure additionnelle recommanderiez-vous ?",
        options: [
          "Interdire les connexions en dehors des heures de bureau",
          "Mettre en place l'authentification à deux facteurs (2FA) pour tous les comptes",
          "Limiter l'accès à distance pour tous les employés",
          "Bloquer toutes les connexions depuis l'étranger"
        ],
        correctOption: 1,
        feedback: {
          correct: "Parfait ! L'authentification à deux facteurs est l'une des mesures les plus efficaces pour protéger les comptes, même en cas de compromission du mot de passe.",
          incorrect: "Cette mesure pourrait être trop restrictive et nuire à la productivité sans nécessairement améliorer la sécurité de manière significative. L'authentification à deux facteurs offre une meilleure protection."
        }
      },
      {
        description: "Comment aideriez-vous les employés à gérer leurs multiples mots de passe complexes ?",
        options: [
          "Leur demander de noter leurs mots de passe dans un document protégé",
          "Créer un système où tous les mots de passe suivent un modèle prévisible",
          "Recommander l'utilisation d'un gestionnaire de mots de passe sécurisé",
          "Attribuer les mêmes mots de passe à des groupes d'employés ayant des fonctions similaires"
        ],
        correctOption: 2,
        feedback: {
          correct: "Excellent ! Les gestionnaires de mots de passe permettent aux utilisateurs de créer et stocker des mots de passe uniques et complexes sans avoir à les mémoriser.",
          incorrect: "Cette approche présente des risques de sécurité significatifs. Les gestionnaires de mots de passe offrent une solution beaucoup plus sécurisée et pratique."
        }
      }
    ]
  },
  quiz: [
    {
      question: "Parmi ces mots de passe, lequel est le plus sécurisé ?",
      options: [
        "Azerty123!",
        "M0nM0tDePa$$e",
        "VoitureMaisonJardinFleur",
        "j'aime les longues phrases de passe sécurisées"
      ],
      correctAnswer: 3,
      explanation: "Les phrases de passe longues, même sans caractères spéciaux, sont plus sécurisées que les mots de passe courts avec des caractères spéciaux. La longueur est le facteur le plus important pour la résistance aux attaques par force brute."
    },
    {
      question: "Quelle pratique est la plus dangereuse concernant les mots de passe ?",
      options: [
        "Utiliser un gestionnaire de mots de passe",
        "Réutiliser le même mot de passe sur plusieurs sites",
        "Utiliser l'authentification à deux facteurs",
        "Changer de mot de passe uniquement en cas de suspicion de compromission"
      ],
      correctAnswer: 1,
      explanation: "La réutilisation des mots de passe est extrêmement dangereuse car si un site est compromis, les attaquants peuvent essayer le même mot de passe sur d'autres services, ce qui peut entraîner de multiples compromissions."
    },
    {
      question: "Qu'est-ce que l'authentification à deux facteurs (2FA) ?",
      options: [
        "L'utilisation de deux mots de passe différents",
        "La vérification de l'identité par deux personnes différentes",
        "La combinaison de quelque chose que vous savez (mot de passe) et quelque chose que vous possédez (téléphone, clé de sécurité)",
        "L'authentification par reconnaissance faciale et empreinte digitale"
      ],
      correctAnswer: 2,
      explanation: "L'authentification à deux facteurs combine deux éléments : généralement quelque chose que vous savez (mot de passe) et quelque chose que vous possédez (comme un téléphone qui reçoit un code par SMS ou qui génère un code via une application)."
    }
  ],
  resources: [
    {
      title: "Recommandations de l'ANSSI sur les mots de passe",
      source: "ANSSI",
      url: "https://www.ssi.gouv.fr/guide/mot-de-passe/"
    },
    {
      title: "Guide CNIL sur la sécurisation des mots de passe",
      source: "CNIL",
      url: "https://www.cnil.fr/fr/les-conseils-de-la-cnil-pour-un-bon-mot-de-passe"
    }
  ]
};

export default function SensibilisationSimplePage() {
  const { isDark } = useTheme();
  const [currentLevel, setCurrentLevel] = useState<string | null>("phishing");
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  
  const handleLevelComplete = (levelId: string) => {
    if (!completedLevels.includes(levelId)) {
      setCompletedLevels([...completedLevels, levelId]);
    }
    setCurrentLevel(null);
  };
  
  const progressPercentage = (completedLevels.length / 5) * 100;
  
  return (
    <HomeLayout>
      <PageTitle title="Sensibilisation à la Cybersécurité" />
      
      <div className={`min-h-screen p-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50'}`}>
        <div className="container mx-auto">
          <div className="mb-4">
            <Link href="/cyber/learning/cyber-mastery">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour aux parcours
              </Button>
            </Link>
          </div>
          
          <Card className={`${isDark ? 'bg-slate-800 text-white' : 'bg-white'} mb-8`}>
            <CardHeader>
              <CardTitle className={`text-2xl ${isDark ? 'text-white' : 'text-blue-800'}`}>Module de Sensibilisation Cybersécurité</CardTitle>
            </CardHeader>
            <CardContent className={isDark ? 'text-white' : 'text-slate-800'}>
              <p className="mb-4">
                Bienvenue dans le module de sensibilisation à la cybersécurité.
                Ce module vous aidera à reconnaître et à vous protéger contre les menaces cyber les plus courantes.
              </p>
              <p className="mb-4">
                Ce module complet comprend :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2 mb-6">
                <li>5 niveaux progressifs de difficulté croissante</li>
                <li>15 scénarios interactifs basés sur des situations réelles</li>
                <li>Plus de 45 quiz pour évaluer et renforcer vos connaissances</li>
                <li>Des conseils pratiques de sécurité validés par des experts</li>
                <li>Des références vers les ressources officielles de l'ANSSI et de la CNIL</li>
              </ul>

              <div className={`mb-8 p-6 rounded-lg ${isDark ? 'bg-slate-700/60' : 'bg-blue-50/60'} flex flex-col items-center`}>
                <h3 className={`font-bold text-xl mb-4 ${isDark ? 'text-white' : 'text-blue-800'}`}>Progression des niveaux</h3>
                <div className="w-full max-w-xl h-3 bg-gray-300 rounded-full mb-4 overflow-hidden">
                  <div className="h-3 bg-blue-600 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className={`text-center ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Vous avez complété {completedLevels.length}/5 niveaux de ce module.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div 
                  className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'} 
                    flex flex-col items-center cursor-pointer
                    ${completedLevels.includes("phishing") ? 'ring-2 ring-green-500' : 'hover:ring-2 hover:ring-blue-400'}
                  `}
                  onClick={() => setCurrentLevel("phishing")}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                    ${completedLevels.includes("phishing") 
                      ? isDark ? 'bg-green-700' : 'bg-green-500' 
                      : isDark ? 'bg-blue-600' : 'bg-blue-100'}`
                  }>
                    {completedLevels.includes("phishing") ? (
                      <span className={`font-bold ${isDark ? 'text-green-200' : 'text-white'}`}>✓</span>
                    ) : (
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>1</span>
                    )}
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-blue-800'}`}>Phishing</h3>
                </div>
                
                <div 
                  className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-blue-50'} 
                    flex flex-col items-center cursor-pointer
                    ${completedLevels.includes("passwords") ? 'ring-2 ring-green-500' : 'hover:ring-2 hover:ring-blue-400'}
                  `}
                  onClick={() => setCurrentLevel("passwords")}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                    ${completedLevels.includes("passwords") 
                      ? isDark ? 'bg-green-700' : 'bg-green-500' 
                      : isDark ? 'bg-blue-600' : 'bg-blue-100'}`
                  }>
                    {completedLevels.includes("passwords") ? (
                      <span className={`font-bold ${isDark ? 'text-green-200' : 'text-white'}`}>✓</span>
                    ) : (
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-blue-800'}`}>2</span>
                    )}
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-blue-800'}`}>Mots de passe</h3>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/70' : 'bg-slate-200/50'} flex flex-col items-center opacity-70`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-600'}`}>3</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-slate-700'}`}>Protection des données</h3>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/70' : 'bg-slate-200/50'} flex flex-col items-center opacity-70`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-600'}`}>4</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-slate-700'}`}>Sécurité mobile</h3>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/70' : 'bg-slate-200/50'} flex flex-col items-center opacity-70`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-600'}`}>5</span>
                  </div>
                  <h3 className={`font-medium text-center ${isDark ? 'text-white' : 'text-slate-700'}`}>Réseaux sociaux</h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {currentLevel === "phishing" && (
            <InteractiveLearningLevel 
              level={phishingLevel} 
              isDark={isDark} 
              onComplete={() => handleLevelComplete("phishing")}
            />
          )}
          
          {currentLevel === "passwords" && (
            <InteractiveLearningLevel 
              level={passwordLevel} 
              isDark={isDark} 
              onComplete={() => handleLevelComplete("passwords")}
            />
          )}
          
          {completedLevels.length > 0 && completedLevels.length < 5 && currentLevel === null && (
            <Card className={`${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border mb-6`}>
              <CardContent className="flex flex-col items-center pt-6 pb-4">
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Progression en cours</h3>
                <p className={`text-center mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Vous avez complété {completedLevels.length} niveau(x) sur 5. Continuez votre apprentissage pour maîtriser tous les aspects de la cybersécurité !
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  {completedLevels.includes("phishing") && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>Badge Expert Phishing</div>
                  )}
                  {completedLevels.includes("passwords") && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>Badge Maître des Mots de Passe</div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {completedLevels.length === 5 && currentLevel === null && (
            <Card className={`${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border mb-6`}>
              <CardContent className="flex flex-col items-center pt-6 pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-green-800' : 'bg-green-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-green-700' : 'bg-green-500'}`}>
                      <span className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-white'}`}>✓</span>
                    </div>
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-green-300' : 'text-green-700'}`}>Module complété avec succès!</h3>
                <p className={`text-center mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Félicitations! Vous avez complété tous les niveaux de ce module et maîtrisez maintenant les concepts essentiels de sensibilisation à la cybersécurité.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>Badge Expert Phishing</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>Badge Maître des Mots de Passe</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-emerald-900/50 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}>Badge Protection des Données</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-amber-900/50 text-amber-200' : 'bg-amber-100 text-amber-700'}`}>Badge Sécurité Mobile</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}`}>Badge Réseaux Sociaux</div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className={`text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Link href="/cyber/learning/cyber-mastery">
              <Button variant="outline" className="mr-2">Retourner à la page Cyber Mastery</Button>
            </Link>
            {currentLevel === null && completedLevels.length > 0 && completedLevels.length < 5 && (
              <Button
                className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                onClick={() => setCurrentLevel(completedLevels.includes("phishing") ? "passwords" : "phishing")}
              >
                Continuer l'apprentissage
              </Button>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}