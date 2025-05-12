import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
// Icônes modernes de React Icons
import { IoHome as IoHomeIcon, IoSearchOutline, IoBookOutline, IoDesktopOutline, IoTrophyOutline, IoConstructOutline } from 'react-icons/io5';
import { BsKanban, BsPeopleFill, BsClipboardCheck, BsGearFill, 
         BsLightbulb, BsBookmarkCheck, BsClipboardData, BsFileEarmarkText, 
         BsFileEarmarkCode } from 'react-icons/bs';
import { RiTeamLine, RiUserSettingsLine } from 'react-icons/ri';
import { MdOutlineEmojiEvents } from 'react-icons/md';
import { FaProjectDiagram, FaRegChartBar } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Types pour l'organisation des modules
interface ModeItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  destination: string;
  comingSoon?: boolean;
  isNew?: boolean;
}

interface ModeOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  destination: string;
  comingSoon?: boolean;
  items: ModeItem[];
}

export default function AmoaModeSelection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Liste complète des modules AMOA organisés par objectif d'apprentissage
  const amoaModes: ModeOption[] = [
    {
      id: 'seformer',
      title: "SE FORMER",
      description: "Développez vos connaissances fondamentales en AMOA et gestion de projet",
      icon: <IoBookOutline className="h-6 w-6 text-blue-100" />,
      gradient: 'from-blue-700 to-blue-900',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'mc2i-ai-learning',
          title: 'mc2i AI LEARNING',
          icon: <RiUserSettingsLine className="h-5 w-5" />,
          destination: '/outils-ia/mc2i-learning',
          comingSoon: false,
          isNew: true
        },
        {
          id: 'modules-express',
          title: 'MODULES EXPRESS',
          icon: <BsBookmarkCheck className="h-5 w-5" />,
          destination: '/amoa/modules-express',
          comingSoon: false
        },
        {
          id: 'referentiel-amoa',
          title: 'RÉFÉRENTIEL AMOA',
          icon: <BsFileEarmarkText className="h-5 w-5" />,
          destination: '/amoa/referentiel',
          comingSoon: true
        }
      ]
    },
    {
      id: 'sentrainer',
      title: "S'ENTRAÎNER",
      description: "Mettez en pratique vos connaissances avec des exercices interactifs et des simulations",
      icon: <IoDesktopOutline className="h-6 w-6 text-indigo-100" />,
      gradient: 'from-indigo-700 to-indigo-900',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'projet-imposteur',
          title: 'QUI EST L\'IMPOSTEUR ?',
          icon: <BsPeopleFill className="h-5 w-5" />,
          destination: '/amoa/projet-imposteur',
          comingSoon: false
        },
        {
          id: 'simulation-reunion',
          title: 'SIMULATION RÉUNION',
          icon: <RiTeamLine className="h-5 w-5" />,
          destination: '/amoa/simulation-reunion',
          comingSoon: true
        },
        {
          id: 'analyse-besoins',
          title: 'ATELIER BESOINS',
          icon: <BsLightbulb className="h-5 w-5" />,
          destination: '/amoa/analyse-besoins',
          comingSoon: true
        }
      ]
    },
    {
      id: 'sevaluer',
      title: "S'ÉVALUER",
      description: "Testez vos compétences dans des conditions réelles d'examen ou d'entretien",
      icon: <IoTrophyOutline className="h-6 w-6 text-purple-100" />,
      gradient: 'from-purple-700 to-purple-900',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'interview-simulation',
          title: 'AUDITION CLIENT',
          icon: <BsClipboardCheck className="h-5 w-5" />,
          destination: '/amoa/interview-simulation',
          comingSoon: false
        },
        {
          id: 'test-reflexes',
          title: 'TEST DE RÉFLEXES',
          icon: <IoTrophyOutline className="h-5 w-5" />,
          destination: '/amoa/test-reflexes',
          comingSoon: false
        },
        {
          id: 'certification-interne',
          title: 'CERTIFICATION INTERNE',
          icon: <MdOutlineEmojiEvents className="h-5 w-5" />,
          destination: '/amoa/certification',
          comingSoon: true
        }
      ]
    },
    {
      id: 'creer',
      title: "CRÉER/AUTOMATISER",
      description: "Utilisez des outils pour générer du contenu et automatiser des tâches AMOA",
      icon: <IoConstructOutline className="h-6 w-6 text-cyan-100" />,
      gradient: 'from-cyan-700 to-cyan-900',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'generateur-livrables',
          title: 'GÉNÉRATEUR DE LIVRABLES',
          icon: <BsFileEarmarkCode className="h-5 w-5" />,
          destination: '/amoa/generateur-livrables',
          comingSoon: true,
          isNew: true
        },
        {
          id: 'toolkit-amoa',
          title: 'TOOLKIT AMOA',
          icon: <BsGearFill className="h-5 w-5" />,
          destination: '/amoa/toolkit',
          comingSoon: true
        }
      ]
    }
  ];

  // Parcours métiers AMOA
  const careerPaths: ModeOption[] = [
    {
      id: 'consultant-amoa',
      title: 'Consultant AMOA',
      description: "Accompagner les projets informatiques depuis l'expression de besoin jusqu'au déploiement",
      icon: <BsClipboardData className="h-6 w-6 text-blue-100" />,
      gradient: 'from-blue-600 to-blue-800',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'mc2i-ai-learning',
          title: 'mc2i AI LEARNING',
          icon: <RiUserSettingsLine className="h-5 w-5" />,
          destination: '/outils-ia/mc2i-learning',
          comingSoon: false
        },
        {
          id: 'modules-express',
          title: 'MODULES EXPRESS',
          icon: <BsBookmarkCheck className="h-5 w-5" />,
          destination: '/amoa/modules-express',
          comingSoon: false
        },
        {
          id: 'interview-simulation',
          title: 'AUDITION CLIENT',
          icon: <BsClipboardCheck className="h-5 w-5" />,
          destination: '/amoa/interview-simulation',
          comingSoon: false
        },
        {
          id: 'projet-imposteur',
          title: 'QUI EST L\'IMPOSTEUR ?',
          icon: <BsPeopleFill className="h-5 w-5" />,
          destination: '/amoa/projet-imposteur',
          comingSoon: false
        }
      ]
    },
    {
      id: 'product-owner',
      title: 'Product Owner',
      description: "Gérer le backlog produit et prioriser les fonctionnalités dans un contexte Agile",
      icon: <BsKanban className="h-6 w-6 text-green-100" />,
      gradient: 'from-green-600 to-green-800',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'mc2i-ai-learning',
          title: 'mc2i AI LEARNING',
          icon: <RiUserSettingsLine className="h-5 w-5" />,
          destination: '/outils-ia/mc2i-learning',
          comingSoon: false
        },
        {
          id: 'modules-express',
          title: 'MODULES EXPRESS',
          icon: <BsBookmarkCheck className="h-5 w-5" />,
          destination: '/amoa/modules-express',
          comingSoon: false
        },
        {
          id: 'analyse-besoins',
          title: 'ATELIER BESOINS',
          icon: <BsLightbulb className="h-5 w-5" />,
          destination: '/amoa/analyse-besoins',
          comingSoon: true
        }
      ]
    },
    {
      id: 'business-analyst',
      title: 'Business Analyst',
      description: "Analyser et modéliser les processus métier pour concevoir des solutions optimales",
      icon: <FaRegChartBar className="h-6 w-6 text-amber-100" />,
      gradient: 'from-amber-600 to-amber-800',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'mc2i-ai-learning',
          title: 'mc2i AI LEARNING',
          icon: <RiUserSettingsLine className="h-5 w-5" />,
          destination: '/outils-ia/mc2i-learning',
          comingSoon: false
        },
        {
          id: 'analyse-besoins',
          title: 'ATELIER BESOINS',
          icon: <BsLightbulb className="h-5 w-5" />,
          destination: '/amoa/analyse-besoins',
          comingSoon: true
        },
        {
          id: 'test-reflexes',
          title: 'TEST DE RÉFLEXES',
          icon: <IoTrophyOutline className="h-5 w-5" />,
          destination: '/amoa/test-reflexes',
          comingSoon: false
        }
      ]
    },
    {
      id: 'chef-projet',
      title: 'Chef de Projet',
      description: "Piloter des projets informatiques en respectant le budget, les délais et la qualité",
      icon: <FaProjectDiagram className="h-6 w-6 text-red-100" />,
      gradient: 'from-red-600 to-red-800',
      destination: '#',
      comingSoon: false,
      items: [
        {
          id: 'modules-express',
          title: 'MODULES EXPRESS',
          icon: <BsBookmarkCheck className="h-5 w-5" />,
          destination: '/amoa/modules-express',
          comingSoon: false
        },
        {
          id: 'test-reflexes',
          title: 'TEST DE RÉFLEXES',
          icon: <IoTrophyOutline className="h-5 w-5" />,
          destination: '/amoa/test-reflexes',
          comingSoon: false
        },
        {
          id: 'simulation-reunion',
          title: 'SIMULATION RÉUNION',
          icon: <RiTeamLine className="h-5 w-5" />,
          destination: '/amoa/simulation-reunion',
          comingSoon: true
        },
        {
          id: 'certification-interne',
          title: 'CERTIFICATION INTERNE',
          icon: <MdOutlineEmojiEvents className="h-5 w-5" />,
          destination: '/amoa/certification',
          comingSoon: true
        }
      ]
    }
  ];

  // Filtrer les modes en fonction de la recherche
  const filteredModes = amoaModes.filter(mode => {
    const matchesSearch = mode.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         mode.description.toLowerCase().includes(searchQuery.toLowerCase());
                         
    const hasMatchingItems = mode.items.some(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return matchesSearch || hasMatchingItems;
  });

  const filteredCareers = careerPaths.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          career.description.toLowerCase().includes(searchQuery.toLowerCase());
                           
    const hasMatchingItems = career.items.some(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return matchesSearch || hasMatchingItems;
  });

  return (
    <HomeLayout>
      <PageTitle title="I AM mc2i" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-[#006a9e] to-blue-900">
        {/* Bouton retour à l'accueil */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline" 
            className="bg-gradient-to-r from-blue-600 to-blue-800 border-white/20 text-white hover:bg-blue-700 hover:text-white"
            onClick={() => window.location.href = '/'}
          >
            <IoHomeIcon className="h-4 w-4 mr-2" />
            Accueil
          </Button>
        </div>
        
        {/* Arrière-plan simplifié */}
        <div className="absolute inset-0 w-full h-full opacity-20">
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
              I AM <span className="text-blue-300">mc2i</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Choisissez votre parcours d'apprentissage en transformation numérique
            </p>
          </motion.div>

          {/* Barre de recherche */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un module..."
                className="pl-10 pr-4 py-2 w-full bg-white/10 border-white/20 text-white placeholder-blue-200/70 focus:border-blue-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Rangés par objectifs */}
          <h2 className="text-xl text-white font-semibold mb-6 flex items-center">
            <span className="bg-blue-500/30 rounded-full p-1.5 mr-2">
              <IoBookOutline className="h-5 w-5 text-blue-200" />
            </span>
            Rangés par objectifs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-3 sm:px-6 max-w-full mx-auto mb-10">
            {filteredModes.map((category, index) => (
              <motion.div
                key={category.id}
                data-id={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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
                    <p className="text-blue-100 mb-2 text-xs lg:text-sm text-center line-clamp-2 px-1">
                      {category.description}
                    </p>
                    
                    {/* Liste des modules dans cette catégorie */}
                    <div className="mt-4 flex-grow">
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <Link key={item.id} href={item.comingSoon ? '#' : item.destination} onClick={(e) => item.comingSoon && e.preventDefault()}>
                            <div className="flex items-center p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/20 shadow-sm hover:shadow-md hover:border-white/40">
                              <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white font-medium text-base">{item.title}</h3>
                                  {item.isNew && (
                                    <Badge className="ml-auto text-xs bg-blue-600 text-white">NOUVEAU</Badge>
                                  )}
                                </div>
                              </div>
                              {item.comingSoon ? (
                                <Badge variant="outline" className="border-amber-500 text-amber-400 text-xs">
                                  Bientôt
                                </Badge>
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
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Rangés par métiers */}
          <h2 className="text-xl text-white font-semibold mb-6 mt-8 flex items-center">
            <span className="bg-blue-500/30 rounded-full p-1.5 mr-2">
              <BsPeopleFill className="h-5 w-5 text-blue-200" />
            </span>
            Rangés par métiers
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-3 sm:px-6 max-w-full mx-auto">
            {filteredCareers.map((career, index) => (
              <motion.div
                key={career.id}
                data-id={career.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative overflow-hidden shadow-xl transform transition-all duration-300 hover:shadow-2xl h-full w-full flex-1 rounded-xl"
                onMouseEnter={() => setHoveredMode(career.id)}
                onMouseLeave={() => setHoveredMode(null)}
              >
                {/* Gradient background */}
                <div className={`bg-gradient-to-br ${career.gradient} p-5 lg:p-6 h-full flex flex-col relative overflow-hidden rounded-xl`}>
                  {/* Glow effect on hover */}
                  {hoveredMode === career.id && (
                    <>
                      <div className="absolute inset-0 bg-white opacity-5"></div>
                    </>
                  )}
                  
                  {/* Éléments décoratifs simplifiés */}
                  <div className="absolute h-16 w-16 -top-8 -right-8 bg-white opacity-20 rounded-full blur-md"></div>
                  
                  <div className="flex flex-col h-full relative z-10">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 text-center px-2">
                      {career.title}
                    </h2>
                    <p className="text-blue-100 mb-2 text-xs lg:text-sm text-center line-clamp-2 px-1">
                      {career.description}
                    </p>
                    
                    {/* Liste des modules dans cette catégorie */}
                    <div className="mt-4 flex-grow">
                      <div className="space-y-3">
                        {career.items.map((item) => (
                          <Link key={item.id} href={item.comingSoon ? '#' : item.destination} onClick={(e) => item.comingSoon && e.preventDefault()}>
                            <div className="flex items-center p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/20 shadow-sm hover:shadow-md hover:border-white/40">
                              <div className="flex-grow">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-white font-medium text-base">{item.title}</h3>
                                  {item.isNew && (
                                    <Badge className="ml-auto text-xs bg-blue-600 text-white">NOUVEAU</Badge>
                                  )}
                                </div>
                              </div>
                              {item.comingSoon ? (
                                <Badge variant="outline" className="border-amber-500 text-amber-400 text-xs">
                                  Bientôt
                                </Badge>
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