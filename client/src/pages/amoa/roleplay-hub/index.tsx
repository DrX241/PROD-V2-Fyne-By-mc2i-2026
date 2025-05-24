import React from 'react';
import { useLocation } from 'wouter';
import { 
  ArrowRight, 
  ChevronLeft, 
  Users, 
  Briefcase, 
  FileText, 
  ClipboardCheck, 
  LineChart,
  BrainCircuit,
  Clock,
  MessageSquare,
  LayoutDashboard,
  Target
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

const AmoaRoleplayHub: React.FC = () => {
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
      id: 'consultant-preparation',
      title: "Je suis Consultant",
      description: "Je prépare une audition client",
      link: '/amoa/interview-simulation',
      icon: <Briefcase className="h-10 w-10 text-blue-300" />,
      color: 'blue',
      gradient: 'from-blue-900/70 to-blue-700/30',
      border: 'border-blue-500/30',
      buttonGradient: 'from-blue-700 to-blue-600',
      buttonHover: 'hover:from-blue-600 hover:to-blue-500',
      textColor: 'text-blue-300',
      details: [
        "Dialogues avec clients réalistes",
        "Entraînement à la présentation",
        "Feedback détaillé sur votre performance",
        "15-20 minutes par session"
      ],
      comingSoon: false
    },
    {
      id: 'senior-manager',
      title: "Je suis Sénior Manager",
      description: "Je prépare un RDV commercial",
      link: '/amoa/prospect-pulse',
      icon: <Target className="h-10 w-10 text-orange-300" />,
      color: 'orange',
      gradient: 'from-amber-900/70 to-red-700/30',
      border: 'border-orange-500/30',
      buttonGradient: 'from-amber-600 to-red-600',
      buttonHover: 'hover:from-amber-700 hover:to-red-700',
      textColor: 'text-orange-300',
      details: [
        "Chat client imprévu en temps réel",
        "Réponses limitées à 20 secondes",
        "Scénarios et profils clients variés",
        "Évaluation des compétences commerciales"
      ],
      comingSoon: false
    },
    {
      id: 'project-manager',
      title: 'Je suis Chef de Projet',
      description: "Je gère un projet agile en difficulté",
      link: '/amoa/agile-crisis',
      icon: <ClipboardCheck className="h-10 w-10 text-emerald-300" />,
      color: 'emerald',
      gradient: 'from-emerald-900/70 to-emerald-700/30',
      border: 'border-emerald-500/30',
      buttonGradient: 'from-emerald-700 to-emerald-600',
      buttonHover: 'hover:from-emerald-600 hover:to-emerald-500',
      textColor: 'text-emerald-300',
      details: [
        "Simulation de crise sur un projet agile",
        "Gestion d'équipe et résolution de conflits",
        "Décisions stratégiques sous pression",
        "Analyse des impacts projet et client"
      ],
      comingSoon: true
    },
    {
      id: 'business-analyst',
      title: 'Je suis Business Analyst',
      description: "J'analyse les besoins métier d'un client",
      link: '/amoa/business-analysis',
      icon: <FileText className="h-10 w-10 text-indigo-300" />,
      color: 'indigo',
      gradient: 'from-indigo-900/70 to-indigo-700/30',
      border: 'border-indigo-500/30',
      buttonGradient: 'from-indigo-700 to-indigo-600',
      buttonHover: 'hover:from-indigo-600 hover:to-indigo-500',
      textColor: 'text-indigo-300',
      details: [
        "Techniques d'interview client efficaces",
        "Formalisation de besoins complexes",
        "Gestion des parties prenantes difficiles",
        "Rédaction de livrables professionnels"
      ],
      comingSoon: true
    },
    {
      id: 'scrum-master',
      title: "Je suis Scrum Master",
      description: "J'anime les rituels agiles efficacement",
      link: '/amoa/scrum-facilitation',
      icon: <LayoutDashboard className="h-10 w-10 text-purple-300" />,
      color: 'purple',
      gradient: 'from-purple-900/70 to-purple-700/30',
      border: 'border-purple-500/30',
      buttonGradient: 'from-purple-700 to-purple-600',
      buttonHover: 'hover:from-purple-600 hover:to-purple-500',
      textColor: 'text-purple-300',
      details: [
        "Animation de daily scrum percutants",
        "Facilitation de retrospectives constructives",
        "Résolution des impediments d'équipe",
        "Mesure et amélioration de la vélocité"
      ],
      comingSoon: true
    },
    {
      id: 'product-owner',
      title: "Je suis Product Owner",
      description: "Je priorise efficacement le backlog produit",
      link: '/amoa/product-backlog',
      icon: <BrainCircuit className="h-10 w-10 text-cyan-300" />,
      color: 'cyan',
      gradient: 'from-cyan-900/70 to-cyan-700/30',
      border: 'border-cyan-500/30',
      buttonGradient: 'from-cyan-700 to-cyan-600',
      buttonHover: 'hover:from-cyan-600 hover:to-cyan-500',
      textColor: 'text-cyan-300',
      details: [
        "Élaboration d'user stories impactantes",
        "Techniques avancées de priorisation",
        "Communication efficace avec les développeurs",
        "Gestion des attentes stakeholders"
      ],
      comingSoon: true
    },
    {
      id: 'change-manager',
      title: "Je suis Change Manager",
      description: "Je gère la transformation digitale d'une organisation",
      link: '/amoa/change-management',
      icon: <LineChart className="h-10 w-10 text-rose-300" />,
      color: 'rose',
      gradient: 'from-rose-900/70 to-rose-700/30',
      border: 'border-rose-500/30',
      buttonGradient: 'from-rose-700 to-rose-600',
      buttonHover: 'hover:from-rose-600 hover:to-rose-500',
      textColor: 'text-rose-300',
      details: [
        "Stratégies de gestion de la résistance",
        "Plans de communication efficaces",
        "Mesure de l'adoption du changement",
        "Formation des ambassadeurs du changement"
      ],
      comingSoon: true
    },
    {
      id: 'multi-actors',
      title: "Simulations multi-acteurs",
      description: "Je participe à une réunion avec plusieurs interlocuteurs",
      link: '/amoa/multi-actors',
      icon: <Users className="h-10 w-10 text-amber-300" />,
      color: 'amber',
      gradient: 'from-amber-900/70 to-amber-700/30',
      border: 'border-amber-500/30',
      buttonGradient: 'from-amber-700 to-amber-600',
      buttonHover: 'hover:from-amber-600 hover:to-amber-500',
      textColor: 'text-amber-300',
      details: [
        "Réunions complexes avec plusieurs participants",
        "Gestion des dynamiques de groupe",
        "Adaptation à différents profils d'interlocuteurs",
        "Situations de conflit et négociation"
      ],
      comingSoon: true
    },
    {
      id: 'audio-mode',
      title: "Mode Audio en temps réel",
      description: "J'interagis vocalement avec une IA réactive",
      link: '/amoa/audio-mode',
      icon: <MessageSquare className="h-10 w-10 text-purple-300" />,
      color: 'purple',
      gradient: 'from-purple-900/70 to-purple-700/30',
      border: 'border-purple-500/30',
      buttonGradient: 'from-purple-700 to-purple-600',
      buttonHover: 'hover:from-purple-600 hover:to-purple-500',
      textColor: 'text-purple-300',
      details: [
        "Échanges vocaux naturels et immédiats",
        "Simulation d'appels téléphoniques professionnels",
        "Feedback instantané sur votre communication",
        "Pratique de l'écoute active et du pitch"
      ],
      comingSoon: true
    }
  ];

  // Animation de code en arrière-plan
  const codeLines = [
    "function analyzeSprint(team_velocity, backlog) {",
    "  const estimated_completion = backlog / team_velocity;",
    "  if (estimated_completion > sprint_duration) {",
    "    return { status: 'AT_RISK', adjustment: backlog - (team_velocity * sprint_duration) };",
    "  }",
    "  return { status: 'ON_TRACK', confidence: 0.85 };",
    "}",
    "class ProjectSimulation extends Scenario {",
    "  constructor(complexity, team_size) {",
    "    super();",
    "    this.complexity = complexity;",
    "    this.teamSize = team_size;",
    "    this.challenges = this.generateChallenges();",
    "  }",
    "  generateChallenges() {",
    "    const templates = CHALLENGE_DATABASE.filter(",
    "      template => template.complexity === this.complexity",
    "    );",
    "    return templates[Math.floor(Math.random() * templates.length)];",
    "  }",
    "}"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-950 to-blue-900 text-white p-6 overflow-y-auto">
      {/* Bouton de retour */}
      <div className="absolute top-4 left-4 z-20">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-black/50 border-blue-800 text-blue-400 hover:bg-black/70 hover:text-blue-300 hover:border-blue-500 transition-colors"
          onClick={() => setLocation('/amoa/new')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>

      {/* En-tête */}
      <div className="mb-12 text-center mt-10 relative z-10">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-400 mb-4">
          mc2i ROLE PLAY
        </h1>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg">
          Immergez-vous dans des simulations de rôles professionnels pour développer 
          vos compétences en gestion de projet, agilité et conseil à travers des interactions dynamiques avec l'IA.
        </p>
      </div>

      {/* Animation de code en arrière-plan */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 opacity-60"></div>
        <pre className="text-blue-400 text-xl font-mono font-bold animate-scrolling-code relative z-5">
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
                <CardTitle className={`text-2xl font-bold text-center ${scenario.textColor}`}>
                  {scenario.title}
                </CardTitle>
                <CardDescription className="text-lg text-gray-300 text-center font-medium">
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

export default AmoaRoleplayHub;