import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { motion } from 'framer-motion';

interface ModeItem {
  id: string;
  title: string;
  icon: React.ReactNode | null;
  destination: string;
  comingSoon?: boolean;
}

interface ModeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode | null;
  gradient: string;
  destination: string;
  comingSoon?: boolean;
  items?: ModeItem[];
}

export default function DataIAModeSelection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

  // Structure des modes Data & IA en 4 catégories standardisées
  const dataIAModes: ModeOption[] = [
    {
      id: 'data-trainer',
      title: 'DATA TRAINER',
      description: "Approfondissez les bases de la Data Science, du Machine Learning et de l'IA en interagissant avec une IA experte ou via des parcours guidés.",
      icon: null,
      gradient: 'from-blue-700 to-blue-900',
      destination: '#',
      items: [
        {
          id: 'agent-ia-data',
          title: 'Agent IA',
          icon: null,
          destination: '/data-ia/agent-ia'
        },
        {
          id: 'modules-express',
          title: 'Modules Express',
          icon: null,
          destination: '/data-ia/modules-express'
        }
      ]
    },
    {
      id: 'data-ops',
      title: 'DATA OPS',
      description: "Vivez des projets Data comme si vous y étiez, en vous confrontant à des cas concrets et interactifs.",
      icon: null,
      gradient: 'from-purple-700 to-purple-900',
      destination: '#',
      items: [
        {
          id: 'simulation-mission',
          title: 'Simulation de Mission Data',
          icon: null,
          destination: '/data-ia/simulation-mission'
        },
        {
          id: 'pitch-restitution',
          title: 'Pitch & Restitution',
          icon: null,
          destination: '/data-ia/pitch-restitution'
        }
      ]
    },
    {
      id: 'data-test',
      title: 'DATA TEST',
      description: "Mesurez vos capacités techniques en Python, SQL, Machine Learning ou en IA générative.",
      icon: null,
      gradient: 'from-green-700 to-green-900',
      destination: '#',
      items: [
        {
          id: 'test-technique',
          title: 'Test Technique Data/IA',
          icon: null,
          destination: '/data-ia/test-technique'
        },
        {
          id: 'diagnostic-express',
          title: 'Diagnostic Express',
          icon: null,
          destination: '/data-ia/diagnostic-express'
        }
      ]
    },
    {
      id: 'data-ascension',
      title: 'DATA ASCENSION',
      description: "Un parcours complet pour viser les certifications Data ou affiner son expertise sur des sujets avancés.",
      icon: null,
      gradient: 'from-amber-700 to-amber-900',
      destination: '#',
      comingSoon: true,
      items: []
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="I AM Data & IA" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900">
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={() => setLocation('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              I AM Data & IA
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Développez vos compétences en Data Science, Machine Learning et Intelligence Artificielle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-3 sm:px-6 max-w-full mx-auto">
            {dataIAModes.map((category, index) => (
              <motion.div
                key={category.id}
                className="relative overflow-hidden shadow-xl h-full w-full flex-1 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.03,
                  transition: { duration: 0.2 } 
                }}
              >
                {/* Gradient background */}
                <div className={`bg-gradient-to-br ${category.gradient} p-5 lg:p-6 h-full flex flex-col relative overflow-hidden rounded-xl`}>
                  <div className="flex flex-col h-full relative z-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 text-center">
                      {category.title}
                    </h2>
                    <p className="text-blue-100 mb-3 text-xs lg:text-sm text-center">{category.description}</p>
                    
                    {/* Liste des modules dans cette catégorie */}
                    <div className="mt-4 flex-grow">
                      <div className="space-y-3">
                        {category.items && category.items.map((item, itemIndex) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: (index * 0.1) + (itemIndex * 0.1) }}
                          >
                            <Link href={item.comingSoon ? '#' : item.destination} 
                              onClick={(e) => item.comingSoon && e.preventDefault()}
                            >
                              <div className={`flex items-center p-3 rounded-lg bg-white/10 
                                ${item.comingSoon 
                                  ? 'cursor-not-allowed opacity-70' 
                                  : 'hover:bg-white/20 transition-colors cursor-pointer border border-white/20 shadow-sm hover:shadow-md hover:border-white/40'
                                }`}
                              >
                                <div className="flex-grow">
                                  <h3 className="text-white font-medium">{item.title}</h3>
                                </div>
                                <div className="text-white bg-blue-500/30 p-1 rounded-full">
                                  <ArrowRight className="h-4 w-4" />
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Message "Bientôt disponible" pour les modules qui ne sont pas encore disponibles */}
                    {category.comingSoon && (
                      <motion.div 
                        className="mt-3 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <p className="text-gray-300 text-xs px-3 py-1.5 rounded">Bientôt disponible</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}