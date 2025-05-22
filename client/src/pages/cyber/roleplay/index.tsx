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
  BrainCircuit,
  Clock,
  Bot
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
      id: 'interview-test',
      title: "Je suis Consultant Cyber",
      description: "Je prépare une audition en cybersécurité et je voudrais m'entraîner et être mis en situation",
      link: '/cyber/interview-test',
      icon: <Briefcase className="h-10 w-10 text-blue-300" />,
      color: 'blue',
      gradient: 'from-blue-900/70 to-blue-700/30',
      border: 'border-blue-500/30',
      buttonGradient: 'from-blue-700 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-500',
      textColor: 'text-blue-300',
      details: [
        "Simulations d'entretiens techniques avec feedback",
        "Questions adaptées au niveau et à la spécialité visée",
        "Analyse détaillée de vos réponses pour progresser"
      ],
      comingSoon: false
    },
    {
      id: 'pentest-lab',
      title: 'Je suis Pentester',
      description: "J'explore et j'exploite des vulnérabilités web en environnement contrôlé",
      link: '/cyber/pentest-lab',
      icon: <Terminal className="h-10 w-10 text-purple-300" />,
      color: 'purple',
      gradient: 'from-purple-900/70 to-purple-700/30',
      border: 'border-purple-500/30',
      buttonGradient: 'from-purple-700 to-purple-600',
      buttonHover: 'hover:from-purple-600 hover:to-purple-500',
      textColor: 'text-purple-300',
      details: [
        "Environnement web pour pratiquer l'exploitation",
        "Scénarios adaptés à votre niveau technique",
        "Méthodologie structurée de tests d'intrusion"
      ],
      comingSoon: false
    },
    {
      id: 'crisis-management',
      title: 'Je suis RSSI',
      description: "Je dois gérer une crise suite à un incident de cybersécurité majeur",
      link: '/cyber/crisis-management',
      icon: <AlertTriangle className="h-10 w-10 text-rose-300" />,
      color: 'rose',
      gradient: 'from-rose-900/70 to-rose-700/30',
      border: 'border-rose-500/30',
      buttonGradient: 'from-rose-700 to-rose-600',
      buttonHover: 'hover:from-rose-600 hover:to-rose-500',
      textColor: 'text-rose-300',
      details: [
        "Simulation de crise avec multiples parties prenantes",
        "Décisions stratégiques en temps sous pression",
        "Gestion de la communication interne et externe"
      ],
      comingSoon: false
    },
    {
      id: 'comex-member',
      title: "Je suis Membre du COMEX",
      description: "Je voudrais m'approprier les enjeux et les clés stratégiques de la sécurité numérique",
      link: '/cyber/comex-training',
      icon: <BrainCircuit className="h-10 w-10 text-emerald-300" />,
      color: 'emerald',
      gradient: 'from-emerald-900/70 to-emerald-700/30',
      border: 'border-emerald-500/30',
      buttonGradient: 'from-emerald-700 to-emerald-600',
      buttonHover: 'hover:from-emerald-600 hover:to-emerald-500',
      textColor: 'text-emerald-300',
      details: [
        "Formation adaptée aux dirigeants d'entreprise",
        "Mesure et priorisation des risques numériques",
        "Préparation à la gestion de crise cybernétique"
      ],
      comingSoon: true
    },
    {
      id: 'debutant-cyber',
      title: "Je suis Débutant",
      description: "Je voudrais être sensibilisé aux risques cyber et apprendre à me protéger",
      link: '/cyber/learning-center/modules/debutant-cyber',
      icon: <Shield className="h-10 w-10 text-amber-300" />,
      color: 'amber',
      gradient: 'from-amber-900/70 to-amber-700/30',
      border: 'border-amber-500/30',
      buttonGradient: 'from-amber-700 to-amber-600',
      buttonHover: 'hover:from-amber-600 hover:to-amber-500',
      textColor: 'text-amber-300',
      details: [
        "Contenu adapté aux débutants sans connaissances",
        "Exercices pratiques pour sécuriser vos appareils",
        "Apprentissage des bons réflexes face aux menaces"
      ],
      comingSoon: true
    },
    {
      id: 'assistant-creator',
      title: "Je suis Créateur de Chatbot",
      description: "Je souhaite créer mon propre assistant virtuel spécialisé en cybersécurité",
      link: '/cyber/tools/assistant-cyber',
      icon: <Bot className="h-10 w-10 text-cyan-300" />,
      color: 'cyan',
      gradient: 'from-cyan-900/70 to-cyan-700/30',
      border: 'border-cyan-500/30',
      buttonGradient: 'from-cyan-700 to-cyan-600',
      buttonHover: 'hover:from-cyan-600 hover:to-cyan-500',
      textColor: 'text-cyan-300',
      details: [
        "Création d'un assistant IA personnalisé en cyber",
        "Définition de ses domaines d'expertise",
        "Partage et utilisation collaborative de l'assistant"
      ],
      comingSoon: false
    },
    {
      id: 'recruiter',
      title: "Je suis Recruteur",
      description: "Je souhaite évaluer les compétences techniques d'un candidat en cybersécurité",
      link: '/cyber/test-technique',
      icon: <Users className="h-10 w-10 text-indigo-300" />,
      color: 'indigo',
      gradient: 'from-indigo-900/70 to-indigo-700/30',
      border: 'border-indigo-500/30',
      buttonGradient: 'from-indigo-700 to-indigo-600',
      buttonHover: 'hover:from-indigo-600 hover:to-indigo-500',
      textColor: 'text-indigo-300',
      details: [
        "Évaluation des compétences techniques des candidats",
        "Tests adaptés aux différents profils cyber",
        "Rapports détaillés sur les forces et points d'amélioration"
      ],
      comingSoon: false
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
          Retour
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
                  {scenario.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <div className={`p-1 rounded-full bg-${scenario.color}-900/50 mr-2 mt-0.5`}>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full py-6 bg-gradient-to-r ${scenario.buttonGradient} ${scenario.buttonHover} text-white group`}
                  onClick={() => setLocation(scenario.link)}
                  disabled={scenario.comingSoon}
                >
                  {scenario.comingSoon ? (
                    <span className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Bientôt disponible
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Accéder au scénario
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Note en bas de page */}
      <div className="text-center text-gray-500 mt-12 text-sm">
        <p>Les scénarios sont conçus pour offrir une expérience d'apprentissage dynamique et personnalisée.</p>
      </div>
    </div>
  );
};

export default RoleplayHub;