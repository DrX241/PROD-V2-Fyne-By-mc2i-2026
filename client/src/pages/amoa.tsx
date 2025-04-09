import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Route, 
  FileText, 
  Clock, 
  ZapIcon,
  BarChart2, 
  TrendingUp, 
  MessageSquare, 
  BrainCircuit, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  Presentation, 
  BookText, 
  Lightbulb
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import HomeLayout from "@/components/layout/HomeLayout";

export default function AmoaPage() {
  const [, setLocation] = useLocation();
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  // Liste des modules disponibles en format optimisé pour la nouvelle présentation
  const amoaModules = [
    {
      id: "amoa-quest",
      title: "AMOA QUEST",
      description: "Parcourez une aventure narrative interactive où vous incarnez un Assistant à Maîtrise d'Ouvrage confronté à des défis réels de gestion de projet.",
      icon: <Brain className="w-12 h-12 text-blue-100" />,
      gradient: "from-blue-600 to-blue-900",
      level: "Tous niveaux",
      duration: "45-60 min",
      path: "/amoa/quest",
      isNew: true,
      status: "available",
      cardClass: "amoa-card-1",
      skills: ["Analyse des besoins", "Communication", "Gestion des parties prenantes", "Documentation"]
    },
    {
      id: "sim-project",
      title: "SIMULATEUR DE PROJET",
      description: "Expérimentez la gestion de projets virtuels en temps réel avec une IA qui simule les réactions des équipes et les évènements aléatoires.",
      icon: <Clock className="w-12 h-12 text-indigo-100" />,
      gradient: "from-indigo-600 to-indigo-900",
      level: "Intermédiaire",
      duration: "60-90 min",
      path: "/amoa/simulator",
      isNew: true,
      status: "soon",
      cardClass: "amoa-card-2",
      skills: ["Planification", "Allocation de ressources", "Gestion des risques", "Suivi de projet"]
    },
    {
      id: "toolkit-amoa",
      title: "TOOLKIT AMOA",
      description: "Laboratoire de création de documents assisté par IA. Pratiquez la rédaction de spécifications, cahiers des charges et user stories.",
      icon: <FileText className="w-12 h-12 text-emerald-100" />,
      gradient: "from-emerald-600 to-emerald-900",
      level: "Intermédiaire",
      duration: "Variable",
      path: "/amoa/toolkit",
      isNew: false,
      status: "soon",
      cardClass: "amoa-card-3",
      skills: ["Rédaction technique", "Spécifications", "User Stories", "Analyse fonctionnelle"]
    },
    {
      id: "crisis-manager",
      title: "CRISIS MANAGER",
      description: "Simulation de crise projet où vous devez gérer des situations imprévues et résoudre des problèmes complexes en temps limité.",
      icon: <ZapIcon className="w-12 h-12 text-amber-100" />,
      gradient: "from-amber-600 to-amber-900",
      level: "Avancé",
      duration: "30-40 min",
      path: "/amoa/crisis",
      isNew: false,
      status: "soon",
      cardClass: "amoa-card-4",
      skills: ["Gestion de crise", "Résolution de problèmes", "Prise de décision", "Communication de crise"]
    },
    {
      id: "methodologie-showdown",
      title: "MÉTHODOLOGIE SHOWDOWN",
      description: "Jeu stratégique où vous confrontez différentes méthodologies de gestion de projet selon les contextes et exigences.",
      icon: <Presentation className="w-12 h-12 text-purple-100" />,
      gradient: "from-purple-600 to-purple-900",
      level: "Expert",
      duration: "45-60 min",
      path: "/amoa/methodology",
      isNew: false,
      status: "soon",
      cardClass: "amoa-card-5",
      skills: ["Agilité", "Cycle en V", "SCRUM", "SAFe", "Hybride"]
    },
    {
      id: "business-value",
      title: "BUSINESS VALUE OPTIMIZER",
      description: "Jeu d'optimisation de valeur métier où vous devez équilibrer les contraintes techniques, financières et stratégiques pour maximiser le ROI.",
      icon: <TrendingUp className="w-12 h-12 text-cyan-100" />,
      gradient: "from-cyan-600 to-cyan-900",
      level: "Avancé",
      duration: "40-60 min",
      path: "/amoa/business-value",
      isNew: false,
      status: "soon",
      cardClass: "amoa-card-6",
      skills: ["Analyse coût-bénéfice", "Priorisation", "Stratégie d'entreprise", "ROI"]
    }
  ];

  const features = [
    {
      title: "IA Conversationnelle",
      description: "Interagissez avec des personnages IA avancés qui s'adaptent à vos choix et réponses",
      icon: <MessageSquare className="w-8 h-8 text-blue-300" />
    },
    {
      title: "Scénarios Adaptatifs",
      description: "Des histoires qui évoluent en fonction de vos décisions et de votre style de management",
      icon: <BookText className="w-8 h-8 text-blue-300" />
    },
    {
      title: "Feedback Personnalisé",
      description: "Analyses détaillées de vos compétences et suggestions d'amélioration basées sur l'IA",
      icon: <Lightbulb className="w-8 h-8 text-blue-300" />
    },
    {
      title: "Équipes Virtuelles",
      description: "Collaborez avec des équipes simulées pour développer vos compétences de leadership",
      icon: <Users className="w-8 h-8 text-blue-300" />
    }
  ];

  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900">
        {/* Arrière-plan AMOA */}
        <div className="absolute inset-0 w-full h-full">
          {/* Grille projet */}
          <div className="absolute inset-0 z-0 grid grid-cols-12 grid-rows-12 gap-4 opacity-30">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-blue-500 rounded-md opacity-10"></div>
            ))}
          </div>
          
          {/* Éléments d'arrière-plan pour la thématique AMOA */}
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Lignes connectées représentant un réseau de projet */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              {/* Lignes horizontales */}
              {Array.from({ length: 10 }).map((_, i) => (
                <line 
                  key={`h-${i}`}
                  x1="0" 
                  y1={i * 120} 
                  x2="100%" 
                  y2={i * 120 + (Math.random() * 50)} 
                  stroke="url(#grid-gradient)" 
                  strokeWidth="1.5"
                />
              ))}
              {/* Lignes verticales */}
              {Array.from({ length: 10 }).map((_, i) => (
                <line 
                  key={`v-${i}`}
                  x1={i * 120} 
                  y1="0" 
                  x2={i * 120 + (Math.random() * 50)} 
                  y2="100%" 
                  stroke="url(#grid-gradient)" 
                  strokeWidth="1.5"
                />
              ))}
              {/* Cercles pour représenter des noeuds */}
              {Array.from({ length: 15 }).map((_, i) => (
                <circle
                  key={`c-${i}`}
                  cx={Math.random() * 100 + "%"}
                  cy={Math.random() * 100 + "%"}
                  r={Math.random() * 5 + 3}
                  fill="#60a5fa"
                  opacity="0.6"
                />
              ))}
            </svg>
          </div>

          {/* Animation des éléments de projet (documents, check, calendrier) */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={`symbol-${i}`}
                className="absolute text-blue-300 font-bold animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 5 + 10}s`,
                  opacity: Math.random() * 0.3 + 0.4
                }}
              >
                {Math.random() > 0.7 ? "✓" : Math.random() > 0.4 ? "📄" : "📅"}
              </div>
            ))}
          </div>

          {/* Formes géométriques pour AMOA (carrés et rectangles) */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <svg 
                key={`shape-${i}`}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 40 + 30}px`,
                  height: `${Math.random() * 40 + 30}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 15}s`,
                  opacity: Math.random() * 0.2 + 0.1
                }}
                viewBox="0 0 100 100"
              >
                {Math.random() > 0.5 ? (
                  <rect 
                    x="10" y="10" width="80" height="80"
                    fill="none" 
                    stroke="#60a5fa" 
                    strokeWidth="3"
                  />
                ) : (
                  <rect 
                    x="10" y="25" width="80" height="50"
                    fill="none" 
                    stroke="#60a5fa" 
                    strokeWidth="3"
                  />
                )}
              </svg>
            ))}
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              I AM AMOA
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              Perfectionnez vos compétences en assistance à maîtrise d'ouvrage à travers des expériences immersives guidées par l'IA
            </p>
          </motion.div>

          {/* Modules principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4 sm:px-8 max-w-6xl mx-auto">
            {amoaModules.map((module, index) => (
              <div 
                key={module.id} 
                className="flex h-full"
                onClick={() => module.status === 'available' && setLocation(module.path)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative overflow-hidden shadow-xl cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl h-full w-full flex-1 ${module.cardClass}`}
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                >
                  {/* Gradient background */}
                  <div className={`bg-gradient-to-br ${module.gradient} p-6 sm:p-8 h-full flex flex-col relative overflow-hidden`}>
                    {/* Glow effect on hover */}
                    {hoveredModule === module.id && (
                      <>
                        <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                        <div className="absolute -inset-1 bg-blue-500 opacity-30 blur-xl animate-pulse-glow"></div>
                      </>
                    )}
                    
                    {/* Éléments décoratifs pour design moderne */}
                    <div className="absolute h-16 w-16 -top-8 -right-8 bg-white opacity-20 rounded-full blur-md"></div>
                    <div className="absolute h-24 w-2 bottom-10 -left-1 bg-white opacity-20 rounded-full blur-sm transform rotate-45"></div>
                    <div className="absolute h-1 w-20 top-6 right-6 bg-blue-200 opacity-40"></div>
                    <div className="absolute h-20 w-1 bottom-6 left-12 bg-blue-200 opacity-40"></div>
                    
                    <div className="flex flex-col h-full relative z-10">
                      {/* Icon container */}
                      <div className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 rounded-2xl bg-opacity-20 bg-white flex items-center justify-center mb-4 backdrop-blur-sm mx-auto">
                        {module.icon}
                      </div>
                      
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 text-center">{module.title}</h2>
                      <p className="text-blue-100 mb-6 text-sm lg:text-base flex-grow text-center">{module.description}</p>
                      
                      {/* Skills badges */}
                      <div className="flex flex-wrap gap-2 justify-center mb-6">
                        {module.skills.map((skill, idx) => (
                          <span key={idx} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex justify-center gap-4 text-blue-100 text-sm mb-6">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {module.level}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {module.duration}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center mt-auto">
                        {module.status === 'soon' ? (
                          <div className="bg-white/20 text-white px-4 py-2 rounded-md flex items-center mx-auto backdrop-blur-sm">
                            <span className="animate-pulse mr-2">•</span>
                            Bientôt disponible
                          </div>
                        ) : (
                          <Button 
                            className="bg-white hover:bg-opacity-90 transition-all group text-blue-800"
                            size="sm"
                          >
                            Commencer
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Feature icons */}
                    <div className="absolute bottom-4 right-4 flex gap-3 opacity-20">
                      {module.id === 'amoa-quest' && (
                        <>
                          <Route className="w-6 h-6 text-white" />
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </>
                      )}
                      {module.id === 'sim-project' && (
                        <>
                          <Clock className="w-6 h-6 text-white" />
                          <Users className="w-6 h-6 text-white" />
                        </>
                      )}
                      {module.id === 'toolkit-amoa' && (
                        <>
                          <FileText className="w-6 h-6 text-white" />
                          <BrainCircuit className="w-6 h-6 text-white" />
                        </>
                      )}
                    </div>
                    
                    {/* New badge */}
                    {module.isNew && (
                      <div className="absolute top-3 left-3 bg-white/20 text-white px-2 py-1 text-xs rounded-md backdrop-blur-sm">
                        NOUVEAU
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
          
          {/* Features section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 bg-blue-900/50 backdrop-blur-sm rounded-xl p-8 border border-blue-600/30"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-8">Caractéristiques uniques</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}
                  className="flex items-start"
                >
                  <div className="mr-4 bg-blue-800/50 p-3 rounded-xl backdrop-blur-sm border border-blue-700/50">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-100 mb-2">{feature.title}</h3>
                    <p className="text-blue-200">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-center mt-12"
          >
            <p className="text-blue-200 max-w-2xl mx-auto">
              <span className="font-medium">I AM AMOA</span> utilise l'intelligence artificielle pour créer des expériences d'apprentissage immersives et adaptatives dans le domaine de l'assistance à maîtrise d'ouvrage.
            </p>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}