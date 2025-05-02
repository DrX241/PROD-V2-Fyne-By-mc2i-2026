// Page CYBER AGENT - Nouvelle implémentation
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Mail, ShieldAlert, User, UserCircle2, Activity } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'intro' | 'role-selection' | 'module-selection' | 'skill-test' | 'mission-briefing' | 'mission-active'>('intro');
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
    setCurrentStep('level-assessment');
  };

  // Gestionnaire pour la sélection du niveau d'expertise
  const handleLevelSelect = (level: 'Debutant' | 'Intermediaire' | 'Expert') => {
    const normalizedLevel = level === 'Débutant' ? 'Debutant' : level === 'Intermédiaire' ? 'Intermediaire' : 'Expert';
    setExpertiseLevel(normalizedLevel);
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
            Simulation d'audition spécialisée en cybersécurité
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
                  <h2 className="text-xl font-bold mb-2">Présentation du module</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
                    Ce module simule le contexte d'une audition pour un poste en cybersécurité.
                    Vous serez évalué(e) sur vos compétences techniques et votre capacité à communiquer
                    avec différents interlocuteurs sur des problématiques de sécurité informatique.
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-semibold mb-2">Déroulement de l'audition</h3>
                  <ul className="list-disc pl-5 space-y-2 font-medium text-gray-700 dark:text-gray-300">
                    <li>Choix d'un rôle métier (RSSI, développeur, etc.)</li>
                    <li>Évaluation de votre niveau de compétence initial</li>
                    <li>Présentation à la responsable RH</li>
                    <li>Échanges techniques avec un expert du domaine</li>
                    <li>Évaluation finale et débriefing</li>
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
              <h2 className="text-xl font-bold mb-4">Sélectionnez votre rôle</h2>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-6">
                Chaque rôle offre une expérience d'audition différente avec des questions spécifiques 
                à votre domaine d'expertise.
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
                  <h2 className="text-xl font-bold mb-2">Évaluation du niveau</h2>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Choisissez votre niveau d'expertise en cybersécurité. Cela permettra d'adapter
                    le contenu de l'audition à vos compétences actuelles.
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <Card 
                  className="p-4 cursor-pointer border-2 transition-all hover:border-green-500"
                  onClick={() => handleLevelSelect('Débutant')}
                >
                  <h3 className="font-bold mb-2 text-center">Débutant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                    Connaissances basiques en cybersécurité
                  </p>
                  <Badge variant="outline" className="w-full justify-center py-1">
                    Niveau 1
                  </Badge>
                </Card>
                
                <Card 
                  className="p-4 cursor-pointer border-2 transition-all hover:border-blue-500"
                  onClick={() => handleLevelSelect('Intermédiaire')}
                >
                  <h3 className="font-bold mb-2 text-center">Intermédiaire</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                    Expérience pratique en cybersécurité
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
                    Maîtrise avancée des concepts
                  </p>
                  <Badge variant="outline" className="w-full justify-center py-1">
                    Niveau 3
                  </Badge>
                </Card>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Note: Cette nouvelle version du module CYBER AGENT est en cours de développement.
                  Le choix du niveau affectera les futures interactions mais l'implémentation complète sera disponible prochainement.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}