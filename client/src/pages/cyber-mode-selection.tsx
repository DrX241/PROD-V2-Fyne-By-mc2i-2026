import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Shield, MessageSquare, Bot, ArrowRight, Command, User, Joystick, BrainCircuit, Rocket, ChevronDown, ChevronUp, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

interface ModeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  destination: string;
  items?: Array<{
    id: string;
    title: string;
    icon: React.ReactNode;
    destination: string;
    comingSoon?: boolean;
  }>;
}

export default function CyberModeSelection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Réorganisation des modules en 4 catégories
  const cyberModes: ModeOption[] = [
    {
      id: 'scenarios-formation',
      title: 'SCÉNARIOS DE FORMATION',
      description: "Développez vos compétences en cybersécurité grâce à des mises en situation immersives guidées par l'IA.",
      icon: <BrainCircuit className="w-12 h-12 text-blue-100" />,
      gradient: 'from-blue-700 to-blue-900',
      destination: '#',
      items: [
        {
          id: 'agent-ia',
          title: 'EXPERT CYBER CONVERSATIONNEL',
          icon: <Bot className="w-8 h-8" />,
          destination: '/cyber/agent'
        },
        {
          id: 'cyber-defense',
          title: 'CENTRE DE CRISE ÉVOLUTIF',
          icon: <Shield className="w-8 h-8" />,
          destination: '/cyber-defense'
        }
      ]
    },
    {
      id: 'gamification',
      title: 'GAMIFICATION AVANCÉE',
      description: "Testez vos connaissances en cybersécurité avec des jeux interactifs et ludiques adaptés à tous les niveaux.",
      icon: <Joystick className="w-12 h-12 text-purple-100" />,
      gradient: 'from-purple-700 to-purple-900',
      destination: '#',
      items: [
        {
          id: 'cyber-arcade',
          title: 'CYBER ARCADE',
          icon: <Command className="w-8 h-8" />,
          destination: '/cyber/arcade',
          comingSoon: true
        }
      ]
    },
    {
      id: 'recrutement',
      title: 'MISE EN SITUATION D\'AUDITION',
      description: "Préparez vos consultants à des auditions auprès de clients en cybersécurité avec évaluation détaillée de la prestation.",
      icon: <User className="w-12 h-12 text-green-100" />,
      gradient: 'from-green-700 to-green-900',
      destination: '#',
      items: [
        {
          id: 'interview-simulation',
          title: 'PRÉPARATION D\'AUDITION CLIENT',
          icon: <User className="w-8 h-8" />,
          destination: '/cyber/interview-simulation'
        }
      ]
    },
    {
      id: 'programme-ascension',
      title: 'PROGRAMME ASCENSION',
      description: "Suivez un parcours personnalisé d'accompagnement pour atteindre l'excellence en cybersécurité, préparer des certifications professionnelles et développer vos compétences de manière progressive.",
      icon: <Rocket className="w-12 h-12 text-amber-100" />,
      gradient: 'from-amber-700 to-amber-900',
      destination: '#',
      items: [
        {
          id: 'cyber-ascension',
          title: 'CYBER ASCENSION',
          icon: <Rocket className="w-8 h-8" />,
          destination: '#',
          comingSoon: true
        },
        {
          id: 'parcours-certifiant',
          title: 'PARCOURS CERTIFIANT',
          icon: <Medal className="w-8 h-8" />,
          destination: '#',
          comingSoon: true
        }
      ]
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="I AM CYBER" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900">
        {/* Arrière-plan cybersécurité */}
        <div className="absolute inset-0 w-full h-full">
          {/* Grille numérique */}
          <div className="absolute inset-0 z-0 grid grid-cols-12 grid-rows-12 gap-4 opacity-30">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-blue-500 rounded-md opacity-10"></div>
            ))}
          </div>
          
          {/* Éléments d'arrière-plan pour suggérer la cybersécurité */}
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Lignes connectées représentant un réseau */}
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

          {/* Animation des bits */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={`bit-${i}`}
                className="absolute text-blue-300 font-bold animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 5 + 10}s`,
                  fontSize: `${Math.random() * 14 + 12}px`,
                  opacity: Math.random() * 0.3 + 0.4
                }}
              >
                {Math.random() > 0.5 ? "1" : "0"}
              </div>
            ))}
          </div>

          {/* Hexagones de cybersécurité */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <svg 
                key={`hex-${i}`}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 40 + 40}px`,
                  height: `${Math.random() * 40 + 40}px`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 15}s`,
                  opacity: Math.random() * 0.2 + 0.1
                }}
                viewBox="0 0 100 100"
              >
                <polygon 
                  points="50,3 100,28 100,72 50,97 3,72 3,28" 
                  fill="none" 
                  stroke="#60a5fa" 
                  strokeWidth="3"
                />
              </svg>
            ))}
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              I AM CYBER
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Choisissez votre experience d'apprentissage en cybersecurite
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-3 sm:px-6 max-w-full mx-auto">
            {cyberModes.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative overflow-hidden shadow-xl cursor-pointer transform transition-all duration-300 hover:shadow-2xl h-full w-full flex-1 rounded-xl"
                onMouseEnter={() => setHoveredMode(category.id)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                {/* Gradient background */}
                <div className={`bg-gradient-to-br ${category.gradient} p-5 lg:p-6 h-full flex flex-col relative overflow-hidden rounded-xl`}>
                  {/* Glow effect on hover */}
                  {hoveredMode === category.id && (
                    <>
                      <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                      <div className={`absolute -inset-1 bg-opacity-30 blur-xl animate-pulse-glow`} style={{
                        backgroundColor: category.id === 'scenarios-formation' ? '#3b82f6' : 
                                        category.id === 'gamification' ? '#9333ea' : 
                                        category.id === 'recrutement' ? '#22c55e' : 
                                        '#f59e0b'
                      }}></div>
                    </>
                  )}
                  
                  {/* Éléments décoratifs pour design futuriste */}
                  <div className="absolute h-16 w-16 -top-8 -right-8 bg-white opacity-20 rounded-full blur-md"></div>
                  <div className="absolute h-24 w-2 bottom-10 -left-1 bg-white opacity-20 rounded-full blur-sm transform rotate-45"></div>
                  
                  <div className="flex flex-col h-full relative z-10">
                    {/* Icon container */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-opacity-20 bg-white flex items-center justify-center mb-3 backdrop-blur-sm mx-auto">
                      {category.icon}
                    </div>
                    
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 text-center">
                      {category.title}
                      {(category.id === 'programme-ascension' || category.id === 'gamification') && (
                        <span className="ml-2 text-xs bg-blue-900/60 text-white px-2 py-1 rounded-full inline-flex items-center">
                          <span className="animate-pulse mr-1">•</span>
                          Bientôt
                        </span>
                      )}
                    </h2>
                    <p className="text-blue-100 mb-3 text-xs lg:text-sm text-center">{category.description}</p>
                    
                    {/* Liste des modules dans cette catégorie */}
                    <div className="mt-4 flex-grow">
                      <div className="space-y-3">
                        {category.items && category.items.map((item) => (
                          <Link key={item.id} href={item.comingSoon ? '#' : item.destination} onClick={(e) => item.comingSoon && e.preventDefault()}>
                            <div className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                              <div className="mr-3 text-white">
                                {item.icon}
                              </div>
                              <div className="flex-grow">
                                <h3 className="text-white font-medium">{item.title}</h3>
                              </div>
                              {item.comingSoon ? (
                                <div className="text-xs bg-blue-900/60 text-white px-2 py-1 rounded flex items-center">
                                  <span className="animate-pulse mr-1">•</span>
                                  Bientôt
                                </div>
                              ) : (
                                <div className="text-white">
                                  <ArrowRight className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Bouton d'expansion si nécessaire */}
                    {category.items && category.items.length > 0 && (
                      <div className="mt-4 text-center">
                        <Button 
                          className="bg-white/30 hover:bg-white/40 text-white transition-all"
                          size="sm"
                          onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                        >
                          {expandedCategory === category.id ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Réduire
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Voir tout
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-16 mb-8 bg-blue-900/30 py-8 px-4 rounded-none backdrop-blur-sm w-full"
          >
            <p className="text-xl md:text-2xl text-blue-100 font-medium max-w-full">
              Tous les modes utilisent l'intelligence artificielle pour créer des expériences d'apprentissage immersives et adaptatives.
            </p>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}