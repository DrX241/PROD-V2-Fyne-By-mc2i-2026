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
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              I AM CYBER
            </h1>
            <p className="text-lg sm:text-xl text-blue-700 max-w-3xl mx-auto">
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
            className="text-center mt-12 text-blue-600"
          >
            <p className="text-sm">
              Les deux modes utilisent l'intelligence artificielle pour creer des experiences d'apprentissage immersives et adaptatives.
            </p>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}