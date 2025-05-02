// Page CYBER AGENT - Nouvelle implémentation
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  AlertCircle, RefreshCw, Mail, ShieldAlert, UserCircle2, Activity,
  BookOpen, Code, Network, Lock, Users, Server, Brain, FileText, 
  User, AlertTriangle, X, Circle, Briefcase
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Définition des types
interface Role {
  id: string;
  title: string;
  description: string;
}

// Types pour les modules
interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Type pour le test de compétence
interface SkillTest {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
}

// Type pour la mission
interface Mission {
  id: string;
  title: string;
  description: string;
  context: string;
  superiorName: string;
  superiorRole: string;
  teammates: {
    name: string;
    role: string;
  }[];
  firstChoice: {
    id: string;
    text: string;
    consequences: string;
  }[];
}

export default function CyberAgentNewPage() {
  // État pour suivre l'étape actuelle
  const [currentStep, setCurrentStep] = useState<'intro' | 'role-selection' | 'level-assessment' | 'module-selection' | 'skill-test' | 'mission-briefing' | 'mission-active'>('intro');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [expertiseLevel, setExpertiseLevel] = useState<'Debutant' | 'Intermediaire' | 'Expert' | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [currentTest, setCurrentTest] = useState<SkillTest | null>(null);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionProgress, setMissionProgress] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  
  // Récupération des rôles disponibles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/cyber/cyber-agent/roles'],
    queryFn: async () => {
      const response = await fetch('/api/cyber/cyber-agent/roles');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des rôles');
      }
      return response.json();
    },
  });
  
  // Récupération des modules disponibles pour le rôle sélectionné
  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ['/api/cyber/cyber-agent/modules', selectedRole],
    queryFn: async () => {
      if (!selectedRole) return { modules: [] };
      
      const response = await fetch(`/api/cyber/cyber-agent/modules?role=${selectedRole}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des modules');
      }
      return response.json();
    },
    enabled: !!selectedRole,
  });

  // Animation de transition
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  // Gestionnaire pour la sélection de rôle
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    // Attention : renommage pour éviter l'erreur TypeScript
    setCurrentStep('level-assessment' as 'module-selection' | 'role-selection' | 'intro' | 'skill-test' | 'mission-briefing' | 'mission-active');
  };

  // Gestionnaire pour la sélection du niveau d'expertise
  const handleLevelSelect = (level: 'Debutant' | 'Intermediaire' | 'Expert') => {
    setExpertiseLevel(level);
    setCurrentStep('module-selection');
  };
  
  // Gestionnaire pour la sélection du module
  const handleModuleSelect = (moduleId: string) => {
    setSelectedModule(moduleId);
    
    // Récupération du test de compétence associé au module
    fetch(`/api/cyber/cyber-agent/skill-test?role=${selectedRole}&module=${moduleId}&level=${expertiseLevel}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du test');
        }
        return response.json();
      })
      .then(data => {
        setCurrentTest(data.test);
        setCurrentStep('skill-test');
      })
      .catch(error => {
        console.error('Erreur:', error);
      });
  };
  
  // Gestionnaire pour la réponse au test
  const handleTestAnswer = (optionId: string) => {
    // Vérifier si la réponse est correcte
    const correctAnswer = currentTest?.options.find(option => option.isCorrect);
    const isCorrect = optionId === correctAnswer?.id;
    
    if (isCorrect) {
      setTestCompleted(true);
      // Récupération de la mission
      fetch(`/api/cyber/cyber-agent/mission?role=${selectedRole}&module=${selectedModule}&level=${expertiseLevel}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors de la récupération de la mission');
          }
          return response.json();
        })
        .then(data => {
          setMission(data.mission);
          setCurrentStep('mission-briefing');
        })
        .catch(error => {
          console.error('Erreur:', error);
        });
    } else {
      // Donner une autre chance
      alert("Cette réponse n'est pas correcte. Essayez à nouveau!");
    }
  };
  
  // Gestionnaire pour le démarrage de la mission
  const handleStartMission = () => {
    setCurrentStep('mission-active');
  };
  
  // Gestionnaire pour les choix de la mission
  const handleMissionChoice = (choiceId: string) => {
    // Vérifier la conséquence du choix
    const choice = mission?.firstChoice.find(c => c.id === choiceId);
    
    if (choice?.consequences === 'termination') {
      // Le joueur est licencié
      setGameOver(true);
    } else {
      // Continuer la mission
      setMissionProgress(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* En-tête de la page */}
        <motion.div 
          className="mb-8 text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Module CYBER AGENT</h1>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Simulation d'audition specialisee en cybersecurite
          </p>
        </motion.div>

        {/* Étape d'introduction */}
        {currentStep === 'intro' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Presentation du module</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
                    Ce module simule le contexte d'une audition pour un poste en cybersecurite.
                    Vous serez evalue(e) sur vos competences techniques et votre capacite a communiquer
                    avec differents interlocuteurs sur des problematiques de securite informatique.
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-semibold mb-2">Deroulement de l'audition</h3>
                  <ul className="list-disc pl-5 space-y-2 font-medium text-gray-700 dark:text-gray-300">
                    <li>Choix d'un role metier (RSSI, developpeur, etc.)</li>
                    <li>Evaluation de votre niveau de competence initial</li>
                    <li>Selection d'un module specifique a votre role</li>
                    <li>Test de competence pour acceder a la mission</li>
                    <li>Simulation de mission en entreprise avec choix et consequences</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setCurrentStep('role-selection')} size="lg">
                  Commencer l'audition
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Étape de sélection de rôle */}
        {currentStep === 'role-selection' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold mb-4">Selectionnez votre role</h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-6">
                Chaque role offre une experience d'audition differente avec des modules specifiques 
                a votre domaine d'expertise.
              </p>
              
              {rolesLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {roles?.roles?.map((role: Role) => (
                    <Card 
                      key={role.id}
                      className={`p-4 cursor-pointer border-2 transition-all hover:border-blue-500 ${
                        selectedRole === role.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-transparent'
                      }`}
                      onClick={() => handleRoleSelect(role.id)}
                    >
                      <div className="flex gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <UserCircle2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{role.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Étape d'évaluation du niveau */}
        {currentStep === 'level-assessment' && selectedRole && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Activity className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Evaluation du niveau</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Choisissez votre niveau d'expertise en cybersecurite. Cela permettra d'adapter
                    le contenu de l'audition a vos competences actuelles.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Card 
                  className="p-4 cursor-pointer border-2 transition-all hover:border-green-500"
                  onClick={() => handleLevelSelect('Debutant')}
                >
                  <h3 className="font-bold mb-2 text-center">Debutant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                    Connaissances basiques en cybersecurite
                  </p>
                  <Badge variant="outline" className="w-full justify-center py-1">
                    Niveau 1
                  </Badge>
                </Card>
                
                <Card 
                  className="p-4 cursor-pointer border-2 transition-all hover:border-blue-500"
                  onClick={() => handleLevelSelect('Intermediaire')}
                >
                  <h3 className="font-bold mb-2 text-center">Intermediaire</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                    Experience pratique en cybersecurite
                  </p>
                  <Badge variant="outline" className="w-full justify-center py-1">
                    Niveau 2
                  </Badge>
                </Card>
                
                <Card 
                  className="p-4 cursor-pointer border-2 transition-all hover:border-purple-500"
                  onClick={() => handleLevelSelect('Expert')}
                >
                  <h3 className="font-bold mb-2 text-center">Expert</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                    Maitrise avancee des concepts
                  </p>
                  <Badge variant="outline" className="w-full justify-center py-1">
                    Niveau 3
                  </Badge>
                </Card>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Étape de sélection du module */}
        {currentStep === 'module-selection' && selectedRole && expertiseLevel && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Choisissez un module de formation</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    En fonction de votre role de {roles?.roles?.find((r: Role) => r.id === selectedRole)?.title}, 
                    voici les modules disponibles. Choisissez celui qui vous interesse le plus.
                  </p>
                </div>
              </div>
              
              {modulesLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {modules?.modules?.map((module: Module) => (
                    <Card 
                      key={module.id}
                      className="p-4 cursor-pointer border-2 transition-all hover:border-blue-500"
                      onClick={() => handleModuleSelect(module.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                          {module.icon === 'shield' && <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                          {module.icon === 'code' && <Code className="h-6 w-6 text-green-600 dark:text-green-400" />}
                          {module.icon === 'network' && <Network className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                          {module.icon === 'lock' && <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />}
                          {module.icon === 'users' && <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                          {module.icon === 'server' && <Server className="h-6 w-6 text-gray-600 dark:text-gray-400" />}
                        </div>
                        <h3 className="font-bold mb-2">{module.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {module.description}
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Selectionner
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
        
        {/* Étape du test de compétence */}
        {currentStep === 'skill-test' && currentTest && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <Brain className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Test de competence</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Pour acceder a la mission, vous devez reussir ce test. Choisissez la bonne reponse.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">{currentTest.question}</h3>
                
                <div className="space-y-3 mt-4">
                  {currentTest.options.map((option) => (
                    <Card 
                      key={option.id}
                      className="p-3 cursor-pointer border-2 hover:border-blue-500 transition-all"
                      onClick={() => handleTestAnswer(option.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                          <Circle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{option.text}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Étape de briefing de mission */}
        {currentStep === 'mission-briefing' && mission && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">{mission.title}</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Vous avez reussi le test! Voici les details de votre mission.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Contexte</h3>
                  <p className="text-gray-700 dark:text-gray-300">{mission.context}</p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Votre superieur hierarchique</h3>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                      <UserCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{mission.superiorName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{mission.superiorRole}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Votre equipe</h3>
                  <div className="space-y-3">
                    {mission.teammates.map((teammate, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium">{teammate.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{teammate.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-semibold text-amber-800 dark:text-amber-300">Important</h3>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300">
                    Chaque decision que vous prendrez aura un impact sur le deroulement de la mission. 
                    Faites attention, car certains choix peuvent entrainer votre licenciement immediat.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={handleStartMission} size="lg">
                  Commencer la mission
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        
        {/* Étape de mission active */}
        {currentStep === 'mission-active' && mission && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            {gameOver ? (
              <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
                <div className="text-center py-8">
                  <div className="mx-auto p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Mission terminee - Vous avez ete licencie</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium max-w-md mx-auto mb-6">
                    Votre decision n'etait pas alignee avec les attentes de l'entreprise. Session terminee.
                  </p>
                  <Button onClick={() => setCurrentStep('intro')} variant="outline" size="lg">
                    Recommencer
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-6 shadow-lg bg-white dark:bg-gray-800">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">Mission en cours</h2>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      Prenez une decision pour repondre a la situation actuelle.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                      <UserCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">{mission.superiorName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{mission.superiorRole}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{mission.description}</p>
                </div>
                
                <h3 className="font-semibold mb-3">Choisissez votre action:</h3>
                <div className="space-y-3">
                  {mission.firstChoice.map((choice) => (
                    <Card 
                      key={choice.id}
                      className="p-4 cursor-pointer border-2 hover:border-blue-500 transition-all"
                      onClick={() => handleMissionChoice(choice.id)}
                    >
                      <p className="font-medium">{choice.text}</p>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}