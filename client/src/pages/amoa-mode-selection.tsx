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
  comingSoon?: boolean;
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
      description: "Développez vos compétences en AMOA grâce à des mises en situation guidées par l'IA.",
      icon: null,
      gradient: 'from-blue-700 to-blue-900',
      destination: '#',
      items: [
        {
          id: 'amoa-quest',
          title: 'AMOA QUEST',
          icon: null,
          destination: '/amoa/quest'
        }
      ]
    },
    {
      id: 'gamification',
      title: 'GAMIFICATION AVANCÉE',
      description: "Testez vos connaissances en AMOA avec des jeux interactifs adaptés à tous les niveaux.",
      icon: null,
      gradient: 'from-purple-700 to-purple-900',
      destination: '#',
      items: [
        {
          id: 'projet-imposteur',
          title: 'QUI EST L\'IMPOSTEUR ?',
          icon: null,
          destination: '/amoa/projet-imposteur'
        }
      ]
    },
    {
      id: 'recrutement',
      title: 'MISE EN SITUATION D\'AUDITION',
      description: "Préparez vos consultants aux auditions clients avec évaluation détaillée de leur prestation.",
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
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="IAM mc2i" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900">
        {/* Contenu principal */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              IAM mc2i
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Choisissez votre experience d'apprentissage en assistance à maîtrise d'ouvrage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-3 sm:px-6 max-w-full mx-auto">
            {amoaModes.map((category) => (
              <div
                key={category.id}
                className="relative overflow-hidden shadow-xl h-full w-full flex-1 rounded-xl"
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
                        {category.items && category.items.map((item) => (
                          <Link key={item.id} href={item.destination}>
                            <div className="flex items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors cursor-pointer border border-white/20 shadow-sm hover:shadow-md hover:border-white/40">
                              <div className="flex-grow">
                                <h3 className="text-white font-medium">{item.title}</h3>
                              </div>
                              <div className="text-white bg-blue-500/30 p-1 rounded-full">
                                <ArrowRight className="h-4 w-4" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}