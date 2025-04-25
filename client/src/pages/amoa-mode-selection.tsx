import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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

export default function AmoaModeSelection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Structure des modes AMOA en 4 catégories standardisées
  const amoaModes: ModeOption[] = [
    {
      id: 'scenarios-formation',
      title: 'SCÉNARIOS DE FORMATION',
      description: "Développez vos compétences en AMOA grâce à des mises en situation immersives guidées par l'IA.",
      icon: null,
      gradient: 'from-blue-700 to-blue-900',
      destination: '#',
      items: [
        {
          id: 'amoa-quest',
          title: 'AMOA QUEST',
          icon: null,
          destination: '/amoa/quest'
        },
        {
          id: 'toolkit-amoa',
          title: 'TOOLKIT AMOA',
          icon: null,
          destination: '#',
          comingSoon: true
        }
      ]
    },
    {
      id: 'gamification',
      title: 'GAMIFICATION AVANCÉE',
      description: "Testez vos connaissances en AMOA avec des jeux interactifs et ludiques adaptés à tous les niveaux.",
      icon: null,
      gradient: 'from-purple-700 to-purple-900',
      destination: '#',
      items: [
        {
          id: 'projet-imposteur',
          title: 'QUI EST L\'IMPOSTEUR ?',
          icon: null,
          destination: '/amoa/projet-imposteur'
        },
        {
          id: 'simulateur-projet',
          title: 'SIMULATEUR DE PROJET',
          icon: null,
          destination: '#',
          comingSoon: true
        },
        {
          id: 'business-optimizer',
          title: 'BUSINESS VALUE OPTIMIZER',
          icon: null,
          destination: '#',
          comingSoon: true
        }
      ]
    },
    {
      id: 'recrutement',
      title: 'MISE EN SITUATION D\'AUDITION',
      description: "Préparez vos consultants à des auditions auprès de clients et partenaires commerciaux avec évaluation détaillée de la prestation.",
      icon: null,
      gradient: 'from-green-700 to-green-900',
      destination: '#',
      items: [
        {
          id: 'interview-simulation',
          title: 'PRÉPARATION D\'AUDITION CLIENT',
          icon: null,
          destination: '/amoa/interview-simulation'
        }
      ]
    },
    {
      id: 'programme-ascension',
      title: 'PROGRAMME ASCENSION',
      description: "Suivez un parcours personnalisé d'accompagnement pour atteindre l'excellence en AMOA, préparer des certifications professionnelles et développer vos compétences de manière progressive.",
      icon: null,
      gradient: 'from-amber-700 to-amber-900',
      destination: '#',
      items: [
        {
          id: 'amoa-ascension',
          title: 'AMOA ASCENSION',
          icon: null,
          destination: '#',
          comingSoon: true
        },
        {
          id: 'parcours-certifiant',
          title: 'PARCOURS CERTIFIANT',
          icon: null,
          destination: '#',
          comingSoon: true
        }
      ]
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="IAM mc2i" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900">
        {/* Arrière-plan AMOA */}
        <div className="absolute inset-0 w-full h-full">
          {/* Grille numérique */}
          <div className="absolute inset-0 z-0 grid grid-cols-12 grid-rows-12 gap-4 opacity-30">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-blue-500 rounded-md opacity-10"></div>
            ))}
          </div>
          
          {/* Éléments d'arrière-plan spécifiques à l'AMOA - Diagrammes Gantt, organigrammes */}
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="amoa-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity="0.5" />
                </linearGradient>
                <pattern id="grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="100" height="100" fill="none" stroke="#4b83db" strokeWidth="0.5" strokeOpacity="0.2" />
                </pattern>
              </defs>
              
              {/* Grille de fond pour représenter les tableaux de planification */}
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
              
              {/* Barres de Gantt */}
              {Array.from({ length: 7 }).map((_, i) => (
                <g key={`gantt-${i}`} transform={`translate(${Math.random() * 70}%, ${150 + i * 60})`}>
                  <rect 
                    width={`${Math.random() * 200 + 100}`} 
                    height="20" 
                    rx="2" 
                    fill="url(#amoa-gradient)" 
                    opacity="0.4"
                  />
                  {Math.random() > 0.5 && (
                    <rect 
                      width={`${Math.random() * 50 + 20}`} 
                      height="20" 
                      rx="2"
                      fill="#60a5fa" 
                      opacity="0.6"
                    />
                  )}
                </g>
              ))}
              
              {/* Connecteurs d'organigramme */}
              {Array.from({ length: 8 }).map((_, i) => {
                const x1 = Math.random() * 100;
                const y1 = Math.random() * 100;
                const x2 = x1 + (Math.random() * 30 - 15);
                const y2 = y1 + (Math.random() * 40 + 20);
                
                return (
                  <g key={`org-${i}`}>
                    <line 
                      x1={`${x1}%`} 
                      y1={`${y1}%`} 
                      x2={`${x2}%`} 
                      y2={`${y2}%`} 
                      stroke="#60a5fa" 
                      strokeWidth="2"
                      strokeOpacity="0.4"
                      strokeDasharray={Math.random() > 0.5 ? "5,5" : ""}
                    />
                    {Math.random() > 0.6 && (
                      <circle 
                        cx={`${x2}%`} 
                        cy={`${y2}%`} 
                        r="4" 
                        fill="#60a5fa" 
                        opacity="0.5" 
                      />
                    )}
                  </g>
                );
              })}
              
              {/* Post-it et notes */}
              {Array.from({ length: 5 }).map((_, i) => (
                <rect 
                  key={`note-${i}`}
                  x={`${Math.random() * 90}%`}
                  y={`${Math.random() * 90}%`}
                  width="30"
                  height="30"
                  transform={`rotate(${Math.random() * 20 - 10})`}
                  fill="#60a5fa"
                  opacity="0.3"
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
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              IAM mc2i
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Choisissez votre experience d'apprentissage en assistance à maîtrise d'ouvrage
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-3 sm:px-6 max-w-full mx-auto">
            {amoaModes.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative overflow-hidden shadow-xl transform transition-all duration-300 hover:shadow-2xl h-full w-full flex-1 rounded-xl"
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

                    
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 text-center">
                      {category.title}
                      {category.id === 'programme-ascension' && (
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
                            <div className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer border border-white/20 shadow-sm hover:shadow-md hover:border-white/40">
                              <div className="flex-grow">
                                <h3 className="text-white font-medium">{item.title}</h3>
                              </div>
                              {item.comingSoon ? (
                                <div className="text-xs bg-blue-900/60 text-white px-2 py-1 rounded flex items-center">
                                  <span className="animate-pulse mr-1">•</span>
                                  Bientôt
                                </div>
                              ) : (
                                <div className="text-white bg-blue-500/30 p-1 rounded-full">
                                  <ArrowRight className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Boutons d'expansion supprimés car ils ne servaient à rien */}
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