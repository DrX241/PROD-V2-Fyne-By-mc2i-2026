import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
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
  comingSoon?: boolean;
  items?: Array<{
    id: string;
    title: string;
    icon: React.ReactNode;
    destination: string;
    comingSoon?: boolean;
    isNew?: boolean;
  }>;
}

export default function CyberModeSelection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Réorganisation des modules en 5 catégories selon la nouvelle structure
  const cyberModes: ModeOption[] = [
    {
      id: 'cyber-trainer',
      title: 'CYBERTRAINER',
      description: "Explorez librement la cybersécurité, échangez avec une IA experte ou jouez à des mini-jeux pédagogiques.",
      icon: null,
      gradient: 'from-blue-700 to-blue-900',
      destination: '#',
      items: [
        {
          id: 'agent-ia',
          title: 'AGENT IA',
          icon: null,
          destination: '/cyber/expert-learning'
        },
        {
          id: 'cyber-arcade',
          title: 'CYBERARCADE',
          icon: null,
          destination: '/cyber/arcade'
        }
      ]
    },
    {
      id: 'cyber-ops',
      title: 'CYBEROPS',
      description: "Vivez des scénarios réalistes pour apprendre à réagir comme un professionnel.",
      icon: null,
      gradient: 'from-indigo-700 to-indigo-900',
      destination: '#',
      items: [
        {
          id: 'mise-en-situation',
          title: 'MISE EN SITUATION',
          icon: null,
          destination: '/cyber-defense-new'
        },
        {
          id: 'preparation-audition',
          title: 'PRÉPARATION AUDITION CLIENT',
          icon: null,
          destination: '/cyber/interview-simulation'
        }
      ]
    },
    {
      id: 'cyber-test',
      title: 'CYBERTEST',
      description: "Mesurez vos connaissances techniques et vos réflexes cyber.",
      icon: null,
      gradient: 'from-purple-700 to-purple-900',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'mode-entretien',
          title: 'MODE ENTRETIEN',
          icon: null,
          destination: '/cyber/interview-test',
          comingSoon: false,
          isNew: true
        },
        {
          id: 'test-technique',
          title: 'TEST TECHNIQUE',
          icon: null,
          destination: '/cyber/test-technique',
          comingSoon: false,
          isNew: true
        }
      ]
    },
    {
      id: 'cyber-tools',
      title: 'CYBERTOOLS',
      description: "Utilisez des outils d'automatisation pour générer et transformer des documents de sécurité.",
      icon: null,
      gradient: 'from-teal-700 to-teal-900',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'policy-converter',
          title: 'CONVERTISSEUR DE POLITIQUES',
          icon: null,
          destination: '/cyber/tools/policy-converter',
          comingSoon: false,
          isNew: false
        },
        {
          id: 'phishing-simulator',
          title: 'SIMULATEUR DE PHISHING',
          icon: null,
          destination: '/cyber/tools/phishing-simulator',
          comingSoon: false,
          isNew: true
        }
      ]
    },
    {
      id: 'cyber-ascension',
      title: 'CYBERASCENSION',
      description: "Un programme dédié pour se former et réussir les certifications cybersécurité les plus reconnues.",
      icon: null,
      gradient: 'from-amber-700 to-amber-900',
      destination: '#',
      comingSoon: true,
      items: []
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="I AM CYBER" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900">
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            onClick={() => window.location.href = '/'}
          >
            <Home className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
        
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
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 sm:mb-6 mt-2"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
              I AM CYBER
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Choisissez votre parcours d'apprentissage en cybersécurité
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
                      <div className="absolute inset-0 bg-white opacity-5"></div>
                    </>
                  )}
                  
                  {/* Éléments décoratifs simplifiés */}
                  <div className="absolute h-16 w-16 -top-8 -right-8 bg-white opacity-20 rounded-full blur-md"></div>
                  
                  <div className="flex flex-col h-full relative z-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 text-center px-2">
                      {category.title}
                    </h2>
                    <p className="text-blue-100 mb-2 text-xs lg:text-sm text-center line-clamp-2 px-1">{category.description}</p>
                    
                    {/* Liste des modules dans cette catégorie */}
                    <div className="mt-4 flex-grow">
                      <div className="space-y-3">
                        {category.items && category.items.map((item) => (
                          <Link key={item.id} href={item.comingSoon ? '#' : item.destination} onClick={(e) => item.comingSoon && e.preventDefault()}>
                            <div className="flex items-center p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/20 shadow-sm hover:shadow-md hover:border-white/40">
                              <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white font-medium text-base">{item.title}</h3>
                                </div>
                              </div>
                              <div className="text-white bg-blue-500/30 p-1 rounded-full">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    
                    {/* Message "Bientôt disponible" pour les modules qui ne sont pas encore disponibles */}
                    {category.comingSoon && (
                      <div className="mt-3 text-center">
                        <p className="text-gray-300 text-xs px-3 py-1.5 rounded">Bientôt disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Bannière d'information supprimée pour améliorer les performances */}
        </div>
      </div>
    </HomeLayout>
  );
}