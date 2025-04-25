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

export default function CyberModeSelection() {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Réorganisation des modules en 4 catégories
  const cyberModes: ModeOption[] = [
    {
      id: 'scenarios-formation',
      title: 'SCÉNARIOS DE FORMATION',
      description: "Développez vos compétences en cybersécurité grâce à des mises en situation immersives guidées par l'IA.",
      icon: null,
      gradient: 'from-blue-700 to-blue-900',
      destination: '#',
      items: [
        {
          id: 'agent-ia',
          title: 'AGENT CONVERSATIONNEL',
          icon: null,
          destination: '/cyber/agent'
        }
      ]
    },
    {
      id: 'gamification',
      title: 'GAMIFICATION AVANCÉE',
      description: "Testez vos connaissances en cybersécurité avec des jeux interactifs et ludiques adaptés à tous les niveaux.",
      icon: null,
      gradient: 'from-purple-700 to-purple-900',
      destination: '#',
      items: [
        {
          id: 'cyber-arcade',
          title: 'CYBER ARCADE',
          icon: null,
          destination: '/cyber/arcade',
          comingSoon: true
        }
      ]
    },
    {
      id: 'recrutement',
      title: 'MISE EN SITUATION D\'AUDITION',
      description: "Préparez vos consultants à des auditions auprès de clients en cybersécurité avec évaluation détaillée de la prestation.",
      icon: null,
      gradient: 'from-green-700 to-green-900',
      destination: '#',
      items: [
        {
          id: 'interview-simulation',
          title: 'PRÉPARATION D\'AUDITION CLIENT',
          icon: null,
          destination: '/cyber/interview-simulation'
        }
      ]
    },
    {
      id: 'programme-ascension',
      title: 'PROGRAMME ASCENSION',
      description: "Suivez un parcours personnalisé d'accompagnement pour atteindre l'excellence en cybersécurité, préparer des certifications professionnelles et développer vos compétences de manière progressive.",
      icon: null,
      gradient: 'from-amber-700 to-amber-900',
      destination: '#',
      items: [
        {
          id: 'cyber-ascension',
          title: 'CYBER ASCENSION',
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
      <PageTitle title="I AM CYBER" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-900 via-blue-950 to-black">
        {/* Arrière-plan cybersécurité amélioré */}
        <div className="absolute inset-0 w-full h-full opacity-30">
          {/* Fond cybersécurité avec design hexagonal */}
          <div className="absolute inset-0 bg-[#001529] overflow-hidden">
            {/* Grille hexagonale stylisée */}
            <div className="absolute inset-0 opacity-40" 
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 17.32v34.64L30 60 0 51.96V17.32L30 0zm0 5.38L6.13 20v28.24L30 54.62l23.87-6.38V20L30 5.38z' fill='%23046' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                backgroundSize: "60px 60px"
              }}>
            </div>
            
            {/* Lignes verticales et horizontales pour effet de grille */}
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-cols-12 gap-3 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-cyan-500/30 h-full"></div>
              ))}
            </div>
            <div className="absolute top-0 left-0 right-0 bottom-0 grid grid-rows-12 gap-3 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-b border-cyan-500/30 w-full"></div>
              ))}
            </div>
            
            {/* Points lumineux aléatoires */}
            <div className="absolute inset-0">
              {Array.from({ length: 50 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full bg-cyan-500/60"
                  style={{
                    width: `${Math.max(1, Math.random() * 3)}px`,
                    height: `${Math.max(1, Math.random() * 3)}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    boxShadow: '0 0 4px rgba(6, 182, 212, 0.6)',
                    animation: `pulse ${3 + Math.random() * 3}s infinite`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Contenu principal avec overlay translucide pour améliorer la lisibilité */}
        <div className="relative z-10 max-w-[1600px] w-full mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 bg-blue-950/50 backdrop-blur-sm py-6 px-4 rounded-xl border border-blue-500/20"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 font-cyber-title">
              I AM <span className="text-cyan-400">CYBER</span>
            </h1>
            <div className="h-1 w-40 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mb-4"></div>
            <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
              Choisissez votre expérience d'apprentissage en cybersécurité
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 px-3 sm:px-6 max-w-6xl mx-auto">
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
                {/* Fond de carte amélioré avec effet de profondeur et éléments cyber */}
                <div className={`bg-gradient-to-br ${category.gradient} p-6 h-full flex flex-col relative overflow-hidden rounded-xl border border-white/10`}>
                  {/* Effet de halo au survol */}
                  {hoveredMode === category.id && (
                    <>
                      <div className="absolute inset-0 bg-white opacity-5 animate-pulse-slow"></div>
                      <div className={`absolute -inset-0.5 opacity-40 blur-md animate-pulse-slow z-0`} style={{
                        backgroundColor: category.id === 'scenarios-formation' ? 'rgba(59, 130, 246, 0.5)' : 
                                        category.id === 'gamification' ? 'rgba(147, 51, 234, 0.5)' : 
                                        category.id === 'recrutement' ? 'rgba(34, 197, 94, 0.5)' : 
                                        'rgba(245, 158, 11, 0.5)'
                      }}></div>
                    </>
                  )}
                  
                  {/* Circuit imprimé décoratif en arrière-plan */}
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `${
                      category.id === 'scenarios-formation' ? 
                        "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")" :
                      category.id === 'gamification' ?
                        "url(\"data:image/svg+xml,%3Csvg width='84' height='48' viewBox='0 0 84 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h12v6H0V0zm28 8h12v6H28V8zm14-8h12v6H42V0zm14 0h12v6H56V0zm0 8h12v6H56V8zM42 8h12v6H42V8zm0 16h12v6H42v-6zm14-8h12v6H56v-6zm14 0h12v6H70v-6zm0-16h12v6H70V0zM28 32h12v6H28v-6zM14 16h12v6H14v-6zM0 24h12v6H0v-6zm0 8h12v6H0v-6zm14 0h12v6H14v-6zm14 8h12v6H28v-6zm-14 0h12v6H14v-6zm28 0h12v6H42v-6zm14-8h12v6H56v-6zm0-8h12v6H56v-6zm14 8h12v6H70v-6zm0 8h12v6H70v-6zM14 24h12v6H14v-6zm14-8h12v6H28v-6zM14 8h12v6H14V8zM0 8h12v6H0V8z' fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")" :
                      category.id === 'recrutement' ?
                        "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" :
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='24' viewBox='0 0 88 24'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M13 0v8h-8v8h8v8h8v-8h8v-8h-8v-8h-8zm37 0v8h-8v8h8v8h8v-8h8v-8h-8v-8h-8zm-17 8v8h8v-8h-8zm42 0v8h8v-8h-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }`,
                    backgroundSize: '80px 80px',
                    backgroundPosition: 'center'
                  }}></div>
                  
                  {/* Éléments décoratifs cybernétiques améliorés */}
                  <div className="absolute h-20 w-20 -top-10 -right-10 bg-white opacity-10 rounded-full blur-lg"></div>
                  <div className="absolute h-32 w-2 bottom-5 -left-1 bg-white opacity-10 rounded-full blur-sm transform rotate-45"></div>
                  
                  {/* Lignes horizontales et verticales pour effet technologique */}
                  <div className="absolute top-6 left-0 w-2/3 h-px bg-white opacity-20"></div>
                  <div className="absolute bottom-6 right-0 w-1/2 h-px bg-white opacity-20"></div>
                  <div className="absolute top-0 right-10 w-px h-1/3 bg-white opacity-20"></div>
                  <div className="absolute bottom-0 left-10 w-px h-1/4 bg-white opacity-20"></div>
                  
                  {/* Contenu de la carte avec style cybernétique */}
                  <div className="flex flex-col h-full relative z-10">
                    {/* Titre avec badge "Bientôt" amélioré */}
                    <div className="relative">
                      <div className="flex items-center justify-center">
                        <div className="absolute -top-4 left-0 w-12 h-px bg-white opacity-30"></div>
                        <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold text-white my-3 text-center font-cyber-title tracking-wide">
                          {category.title}
                        </h2>
                        <div className="absolute -top-4 right-0 w-12 h-px bg-white opacity-30"></div>
                      </div>
                      
                      {(category.id === 'programme-ascension' || category.id === 'gamification') && (
                        <div className="absolute -top-2 -right-2 z-20">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600/70 text-white border border-blue-400/30 backdrop-blur-sm shadow-glow-sm">
                            <span className="animate-pulse mr-1.5 text-cyan-300">•</span>
                            Bientôt
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Description avec meilleur contraste et typographie */}
                    <div className="bg-black/30 backdrop-blur-sm p-2 rounded-md mb-4 mt-2">
                      <p className="text-blue-100 text-sm text-center font-cyber-body leading-relaxed">{category.description}</p>
                    </div>
                    
                    {/* Liste des modules dans cette catégorie - Design amélioré */}
                    <div className="mt-4 flex-grow">
                      <div className="space-y-3">
                        {category.items && category.items.map((item, itemIndex) => (
                          <Link 
                            key={item.id} 
                            href={item.comingSoon ? '#' : item.destination} 
                            onClick={(e) => item.comingSoon && e.preventDefault()}
                          >
                            <motion.div
                              className={`flex items-center p-3 rounded-lg ${item.comingSoon ? 'bg-blue-900/20' : 'bg-blue-800/20'} backdrop-blur-sm 
                                ${item.comingSoon ? 'hover:bg-blue-900/30' : 'hover:bg-blue-700/30'} 
                                transition-all duration-300 cursor-pointer border border-blue-300/10 hover:border-blue-300/30
                                shadow-cyber hover:shadow-cyber-lg relative overflow-hidden group`}
                              whileHover={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                              {/* Pulse effect on hover */}
                              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 blur-sm transform group-hover:translate-x-full transition-all duration-1000 ease-out"></div>
                              
                              {/* Numéro de module avec style tech */}
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-900/40 rounded-lg border border-blue-400/20 mr-3 shadow-inner-sm">
                                <span className="text-cyan-300 font-mono text-sm">{(itemIndex + 1).toString().padStart(2, '0')}</span>
                              </div>
                              
                              {/* Contenu du module avec effet de survol */}
                              <div className="flex-grow">
                                <h3 className="text-white font-medium font-cyber-accent tracking-wide group-hover:text-cyan-100 transition-colors">
                                  {item.title}
                                </h3>
                              </div>
                              
                              {/* Indicateurs visuels (badge "Bientôt" ou flèche) */}
                              {item.comingSoon ? (
                                <div className="text-xs bg-black/40 border border-blue-500/20 text-cyan-100 px-2.5 py-1.5 rounded-md flex items-center shadow-glow-sm">
                                  <span className="animate-pulse mr-1.5 text-cyan-300">•</span>
                                  <span className="font-cyber-accent tracking-wide">Bientôt</span>
                                </div>
                              ) : (
                                <div className="text-cyan-300 bg-blue-900/50 border border-blue-400/20 p-1.5 rounded-full group-hover:bg-blue-800 transition-colors">
                                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              )}
                              
                              {/* Ligne de gradient au bas - uniquement visible au survol */}
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </motion.div>
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
          
          {/* Bannière d'information supprimée pour améliorer les performances */}
        </div>
      </div>
    </HomeLayout>
  );
}