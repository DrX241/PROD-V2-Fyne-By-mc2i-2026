import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Shield, MessageSquare, Bot, ArrowRight, Command, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';

interface ModeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  destination: string;
}

export default function CyberModeSelection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const cyberModes: ModeOption[] = [
    {
      id: 'agent-ia',
      title: 'Agent IA',
      description: "Discutez avec un assistant IA specialise en cybersecurite qui adapte ses reponses a vos besoins pour vous fournir des informations et des conseils personnalises.",
      icon: <Bot className="w-12 h-12 text-blue-100" />,
      gradient: 'from-blue-700 to-blue-900',
      destination: '/cyber/agent'
    },
    {
      id: 'cyber-defense',
      title: 'CYBER DEFENSE',
      description: "Prenez les commandes face aux menaces cybernetiques. Dans ce mode, vous decidez des actions a entreprendre tandis que les personnages non-joueurs executent vos directives.",
      icon: <Shield className="w-12 h-12 text-green-100" />,
      gradient: 'from-green-700 to-green-900',
      destination: '/cyber-defense'
    }
  ];

  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gray-900">
        {/* Arrière-plan cybersécurité */}
        <div className="absolute inset-0 w-full h-full opacity-20">
          {/* Grille numérique */}
          <div className="absolute inset-0 z-0 grid grid-cols-12 grid-rows-12 gap-4 opacity-10">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="bg-blue-500 rounded-md opacity-20"></div>
            ))}
          </div>
          
          {/* Éléments d'arrière-plan pour suggérer la cybersécurité */}
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Lignes connectées représentant un réseau */}
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
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
                  strokeWidth="1"
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
                  strokeWidth="1"
                />
              ))}
              {/* Cercles pour représenter des noeuds */}
              {Array.from({ length: 15 }).map((_, i) => (
                <circle
                  key={`c-${i}`}
                  cx={Math.random() * 100 + "%"}
                  cy={Math.random() * 100 + "%"}
                  r={Math.random() * 5 + 2}
                  fill="#60a5fa"
                  opacity="0.3"
                />
              ))}
            </svg>
          </div>

          {/* Animation des bits */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={`bit-${i}`}
                className="absolute text-blue-400 opacity-20 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 5 + 10}s`,
                  fontSize: `${Math.random() * 12 + 12}px`
                }}
              >
                {Math.random() > 0.5 ? "1" : "0"}
              </div>
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
              I AM CYBER
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Choisissez votre experience d'apprentissage en cybersecurite
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {cyberModes.map((mode, index) => (
              <Link key={mode.id} href={mode.destination}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative overflow-hidden rounded-2xl shadow-xl cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                  onMouseEnter={() => setHoveredMode(mode.id)}
                  onMouseLeave={() => setHoveredMode(null)}
                >
                  {/* Gradient background */}
                  <div className={`bg-gradient-to-br ${mode.gradient} p-8 sm:p-10 h-full`}>
                    {/* Glow effect on hover */}
                    {hoveredMode === mode.id && (
                      <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                    )}
                    
                    <div className="flex flex-col h-full relative z-10">
                      {/* Icon container */}
                      <div className="w-20 h-20 rounded-2xl bg-opacity-20 bg-white flex items-center justify-center mb-6 backdrop-blur-sm">
                        {mode.icon}
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{mode.title}</h2>
                      <p className="text-blue-100 mb-8 text-lg flex-grow">{mode.description}</p>
                      
                      <div className="flex items-center mt-auto">
                        <Button 
                          className={`bg-white hover:bg-opacity-90 transition-all group ${mode.id === 'agent-ia' ? 'text-blue-700' : 'text-green-700'}`}
                          size="lg"
                        >
                          Commencer
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Feature icons */}
                    <div className="absolute bottom-8 right-8 flex flex-col gap-4 opacity-20">
                      {mode.id === 'agent-ia' ? (
                        <>
                          <MessageSquare className="w-10 h-10 text-white" />
                          <Command className="w-10 h-10 text-white" />
                        </>
                      ) : (
                        <>
                          <Shield className="w-10 h-10 text-white" />
                          <User className="w-10 h-10 text-white" />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12"
          >
            <p className="text-sm text-blue-300">
              Les deux modes utilisent l'intelligence artificielle pour creer des experiences d'apprentissage immersives et adaptatives.
            </p>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}