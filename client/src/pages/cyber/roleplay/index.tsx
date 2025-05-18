import React from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowRight, 
  ChevronLeft, 
  Users, 
  Briefcase, 
  Terminal, 
  Shield, 
  AlertTriangle,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const RoleplayHub: React.FC = () => {
  const [, setLocation] = useLocation();

  // Animation des cartes
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' }
  };

  // Liste des scénarios de jeu de rôle
  const scenarios = [
    {
      id: 'cyber-arcade',
      title: 'Cyber Arcade',
      description: 'Apprenez les concepts de cybersécurité à travers des jeux interactifs amusants',
      link: '/cyber/arcade',
      icon: <Shield className="h-10 w-10 text-teal-300" />,
      color: 'teal',
      gradient: 'from-teal-900/70 to-teal-700/30',
      border: 'border-teal-500/30',
      buttonGradient: 'from-teal-700 to-teal-600',
      buttonHover: 'hover:from-teal-600 hover:to-teal-500',
      textColor: 'text-teal-300'
    },
    {
      id: 'interview-test',
      title: "Test d'Entretien Cybersécurité",
      description: "Simulez un entretien d'embauche pour un poste en cybersécurité avec un recruteur IA",
      link: '/cyber/interview-test',
      icon: <Briefcase className="h-10 w-10 text-blue-300" />,
      color: 'blue',
      gradient: 'from-blue-900/70 to-blue-700/30',
      border: 'border-blue-500/30',
      buttonGradient: 'from-blue-700 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-500',
      textColor: 'text-blue-300'
    },
    {
      id: 'test-technique',
      title: 'Test Technique de Cybersécurité',
      description: "Mettez vos compétences techniques à l'épreuve dans des situations réalistes",
      link: '/cyber/test-technique',
      icon: <Terminal className="h-10 w-10 text-violet-300" />,
      color: 'violet',
      gradient: 'from-violet-900/70 to-violet-700/30',
      border: 'border-violet-500/30',
      buttonGradient: 'from-violet-700 to-violet-600',
      buttonHover: 'hover:from-violet-600 hover:to-violet-500',
      textColor: 'text-violet-300'
    },
    {
      id: 'ascension',
      title: 'CYBERASCENSION: La montée des Gardiens',
      description: 'Évoluez de débutant à expert à travers une série de niveaux progressifs',
      link: '/cyber/ascension',
      icon: <Users className="h-10 w-10 text-amber-300" />,
      color: 'amber',
      gradient: 'from-amber-900/70 to-amber-700/30',
      border: 'border-amber-500/30',
      buttonGradient: 'from-amber-700 to-amber-600',
      buttonHover: 'hover:from-amber-600 hover:to-amber-500',
      textColor: 'text-amber-300'
    },
    {
      id: 'crisis-management',
      title: 'Gestion de Crise',
      description: "Prenez des décisions critiques lors d'incidents majeurs de cybersécurité",
      link: '/cyber/crisis-management',
      icon: <AlertTriangle className="h-10 w-10 text-rose-300" />,
      color: 'rose',
      gradient: 'from-rose-900/70 to-rose-700/30',
      border: 'border-rose-500/30',
      buttonGradient: 'from-rose-700 to-rose-600',
      buttonHover: 'hover:from-rose-600 hover:to-rose-500',
      textColor: 'text-rose-300'
    },
    {
      id: 'expert-cyber',
      title: 'Expert Cybersécurité',
      description: "Dialoguez librement avec un assistant spécialisé en cybersécurité",
      link: '/cyber/expert-learning',
      icon: <BrainCircuit className="h-10 w-10 text-cyan-300" />,
      color: 'cyan',
      gradient: 'from-cyan-900/70 to-cyan-700/30',
      border: 'border-cyan-500/30',
      buttonGradient: 'from-cyan-700 to-cyan-600',
      buttonHover: 'hover:from-cyan-600 hover:to-cyan-500',
      textColor: 'text-cyan-300'
    }
  ];

  // Animation de code en arrière-plan
  const codeLines = [
    "function detectThreat(network_traffic) {",
    "  const suspicious_patterns = analyzePackets(network_traffic);",
    "  if (suspicious_patterns.length > 0) {",
    "    return { status: 'THREAT_DETECTED', details: suspicious_patterns };",
    "  }",
    "  return { status: 'SECURE', confidence: 0.95 };",
    "}",
    "class MockScenario extends Simulation {",
    "  constructor(difficulty, user_profile) {",
    "    super();",
    "    this.difficulty = difficulty;",
    "    this.userProfile = user_profile;",
    "    this.scenario = this.generateScenario();",
    "  }",
    "  generateScenario() {",
    "    const templates = SCENARIO_DATABASE.filter(",
    "      template => template.difficulty === this.difficulty",
    "    );",
    "    return templates[Math.floor(Math.random() * templates.length)];",
    "  }",
    "}"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-900 text-white p-6">
      {/* Bouton de retour */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/50 border-cyan-800 text-cyan-400 hover:bg-black/70 hover:text-cyan-300 hover:border-cyan-500 transition-colors"
          onClick={() => setLocation('/cyber-v3')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour vers I AM CYBER
        </Button>
      </div>

      {/* En-tête */}
      <div className="mb-12 text-center mt-10 relative z-10">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 cyber-glitch-text mb-4">
          CYBER ROLE PLAY
        </h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Immergez-vous dans des simulations de rôles réalistes pour développer 
          vos compétences en cybersécurité à travers des interactions dynamiques avec l'IA.
        </p>
      </div>

      {/* Animation de code en arrière-plan */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-60"></div>
        <pre className="text-cyan-400 text-xl font-mono font-bold animate-scrolling-code relative z-5">
          {Array(30).fill(codeLines).flat().join('\n')}
        </pre>
      </div>

      {/* Grid des scénarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {scenarios.map((scenario) => (
          <motion.div
            key={scenario.id}
            initial="initial"
            animate="animate"
            whileHover="hover"
            variants={cardVariants}
            transition={{ duration: 0.3 }}
            className="flex"
          >
            <Card className={`w-full bg-gray-900/70 backdrop-blur-sm border-2 ${scenario.border} shadow-lg`}>
              <CardHeader className={`pb-4 bg-gradient-to-br ${scenario.gradient} rounded-t-lg`}>
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full bg-black/30 backdrop-blur-sm`}>
                    {scenario.icon}
                  </div>
                </div>
                <CardTitle className={`text-2xl text-center ${scenario.textColor}`}>
                  {scenario.title}
                </CardTitle>
                <CardDescription className="text-gray-300 text-center">
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className={`space-y-2 ${scenario.textColor} text-sm`}>
                  <li className="flex items-start">
                    <div className={`p-1 rounded-full bg-${scenario.color}-900/50 mr-2 mt-0.5`}>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <span>Interactions réalistes guidées par l'IA</span>
                  </li>
                  <li className="flex items-start">
                    <div className={`p-1 rounded-full bg-${scenario.color}-900/50 mr-2 mt-0.5`}>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <span>Mise en situation immersive et personnalisée</span>
                  </li>
                  <li className="flex items-start">
                    <div className={`p-1 rounded-full bg-${scenario.color}-900/50 mr-2 mt-0.5`}>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <span>Feedback détaillé pour améliorer vos compétences</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full py-6 bg-gradient-to-r ${scenario.buttonGradient} ${scenario.buttonHover} text-white group`}
                  onClick={() => setLocation(scenario.link)}
                >
                  <span>Accéder au scénario</span>
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Note en bas de page */}
      <div className="text-center text-gray-500 mt-12 text-sm">
        <p>Les scénarios sont alimentés par Azure OpenAI pour offrir une expérience d'apprentissage dynamique et personnalisée.</p>
      </div>
    </div>
  );
};

export default RoleplayHub;