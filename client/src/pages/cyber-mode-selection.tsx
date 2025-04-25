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
          title: 'AGENT CONVERSATIONNEL',
          icon: <Bot className="w-8 h-8" />,
          destination: '/cyber/agent'
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
        {/* Arrière-plan cybersécurité simplifié */}
        <div className="absolute inset-0 w-full h-full opacity-20">
          {/* Fond cybersécurité statique avec motif simplifié */}
          <div className="absolute inset-0 bg-[#001529] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-12 gap-3 opacity-30">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-blue-500/20 h-full"></div>
              ))}
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-rows-12 gap-3 opacity-30">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-b border-blue-500/20 w-full"></div>
              ))}
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-3 sm:px-6 max-w-full mx-auto">
            {cyberModes.map((category, index) => (
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
                      <div className="space-y-4">
                        {category.items && category.items.map((item) => (
                          <Link key={item.id} href={item.comingSoon ? '#' : item.destination} onClick={(e) => item.comingSoon && e.preventDefault()}>
                            <div className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer border border-white/20 shadow-sm hover:shadow-md hover:border-white/40">
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