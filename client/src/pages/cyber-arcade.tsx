import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { TerminalSquare, Target, LockKeyhole, Network, BrainCircuit, Users, Shield, Joystick, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';

interface GameOption {
  id: string;
  title: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  icon: React.ReactNode;
  gradient: string;
  comingSoon?: boolean;
}

export default function CyberArcade() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const arcadeGames: GameOption[] = [
    {
      id: 'phishing-detective',
      title: 'Detective de Phishing',
      description: "Apprenez à identifier les emails et messages frauduleux. L'IA génère des messages variés et vous devez repérer les indices suspects.",
      difficulty: 'Facile',
      icon: <TerminalSquare className="w-10 h-10 text-white" />,
      gradient: 'from-blue-700 to-blue-900'
    },
    {
      id: 'password-guardian',
      title: 'Password Guardian',
      description: "Créez des mots de passe que l'IA tentera de déchiffrer. Apprenez les meilleures pratiques de sécurité des mots de passe.",
      difficulty: 'Facile',
      icon: <LockKeyhole className="w-10 h-10 text-white" />,
      gradient: 'from-green-700 to-green-900'
    },
    {
      id: 'firewall-defense',
      title: 'Firewall Defense',
      description: "Un jeu de tower defense où vous protégez un réseau contre des vagues d'attaques cybernétiques.",
      difficulty: 'Moyen',
      icon: <Shield className="w-10 h-10 text-white" />,
      gradient: 'from-amber-600 to-orange-700'
    },
    {
      id: 'codebreaker',
      title: 'Code Breaker',
      description: "Déchiffrez des codes et apprenez les bases de la cryptographie de manière ludique avec des indices progressifs.",
      difficulty: 'Moyen',
      icon: <BrainCircuit className="w-10 h-10 text-white" />,
      gradient: 'from-purple-700 to-purple-900'
    },
    {
      id: 'incident-response',
      title: 'Incident Response Challenge',
      description: "Simulation de réponse à incident en temps limité. Identifiez les menaces et rétablissez la sécurité.",
      difficulty: 'Difficile',
      icon: <Target className="w-10 h-10 text-white" />,
      gradient: 'from-red-700 to-rose-900',
      comingSoon: true
    },
    {
      id: 'social-engineering',
      title: 'Social Engineering Simulator',
      description: "Entraînez-vous à résister aux techniques d'ingénierie sociale et apprenez à protéger les données sensibles.",
      difficulty: 'Moyen',
      icon: <Users className="w-10 h-10 text-white" />,
      gradient: 'from-cyan-600 to-teal-700',
      comingSoon: true
    },
    {
      id: 'blockchain-challenge',
      title: 'Blockchain Challenge',
      description: "Explorez les concepts de blockchain et de sécurité des transactions numériques à travers une série de défis interactifs.",
      difficulty: 'Difficile',
      icon: <Network className="w-10 h-10 text-white" />,
      gradient: 'from-blue-800 to-indigo-900',
      comingSoon: true
    },
    {
      id: 'capture-the-flag',
      title: 'Capture The Flag Lite',
      description: "Version simplifiée des compétitions CTF. Résolvez des énigmes de sécurité informatique adaptées à différents niveaux.",
      difficulty: 'Moyen',
      icon: <Target className="w-10 h-10 text-white" />,
      gradient: 'from-yellow-600 to-amber-800',
      comingSoon: true
    },
    {
      id: 'threat-intelligence',
      title: 'Threat Intelligence',
      description: "Analysez des données pour identifier les menaces potentielles et prédire les vecteurs d'attaque avant qu'ils ne se produisent.",
      difficulty: 'Difficile',
      icon: <BrainCircuit className="w-10 h-10 text-white" />,
      gradient: 'from-slate-700 to-gray-900',
      comingSoon: true
    },
    {
      id: 'bug-bounty-hunter',
      title: 'Bug Bounty Hunter',
      description: "Apprenez à identifier les vulnérabilités dans des applications web simulées et comment les corriger efficacement.",
      difficulty: 'Difficile',
      icon: <Joystick className="w-10 h-10 text-white" />,
      gradient: 'from-emerald-700 to-green-900',
      comingSoon: true
    }
  ];

  return (
    <HomeLayout>
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-purple-900 via-gray-900 to-black">
        {/* Arrière-plan arcade */}
        <div className="absolute inset-0 w-full h-full">
          {/* Grille arcade */}
          <div className="absolute inset-0 z-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1"/>
                </pattern>
                <linearGradient id="arcade-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#arcade-glow)" />
            </svg>
          </div>
          
          {/* Éléments d'animation */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`shape-${i}`}
                className="absolute opacity-20 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 40 + 20}px`,
                  height: `${Math.random() * 40 + 20}px`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '4px',
                  background: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 155 + 100)}, 0.3)`,
                  boxShadow: `0 0 15px rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 155 + 100)}, 0.5)`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`
                }}
              />
            ))}
          </div>

          {/* Effets supplémentaires */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent"></div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <Link href="/cyber" className="inline-flex items-center text-purple-200 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à I AM CYBER
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <Joystick className="h-10 w-10 text-purple-300 mr-3" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">CYBER ARCADE</h1>
            </div>
            <p className="text-lg text-purple-200 max-w-3xl">
              Testez et améliorez vos compétences en cybersécurité à travers notre collection de mini-jeux interactifs et ludiques.
              L'intelligence artificielle s'adapte à votre niveau pour une expérience d'apprentissage personnalisée.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arcadeGames.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 ${game.comingSoon ? 'opacity-70' : ''}`}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
              >
                <div className={`bg-gradient-to-br ${game.gradient} p-6 h-full`}>
                  {/* Badge de difficulté */}
                  <div className={`absolute top-3 right-3 text-xs font-semibold py-1 px-2 rounded-full 
                    ${game.difficulty === 'Facile' ? 'bg-green-200 text-green-800' : 
                     game.difficulty === 'Moyen' ? 'bg-amber-200 text-amber-800' : 
                     'bg-rose-200 text-rose-800'}`}
                  >
                    {game.difficulty}
                  </div>
                  
                  {/* Badge "Bientôt disponible" */}
                  {game.comingSoon && (
                    <div className="absolute top-12 right-0 bg-gray-800 text-gray-200 text-xs font-semibold py-1 px-2 rotate-45 transform origin-top-right">
                      Bientôt disponible
                    </div>
                  )}
                  
                  {/* Glow effect on hover */}
                  {hoveredGame === game.id && (
                    <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                  )}
                  
                  <div className="flex flex-col h-full">
                    <div className="w-16 h-16 rounded-lg bg-black bg-opacity-20 flex items-center justify-center mb-4 animate-game-float">
                      {game.icon}
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">{game.title}</h2>
                    <p className="text-sm text-gray-100 mb-6 flex-grow">{game.description}</p>
                    
                    {game.comingSoon ? (
                      <Button 
                        className="mt-auto bg-white hover:bg-gray-100 text-gray-900 opacity-50 cursor-not-allowed"
                        size="sm"
                        disabled
                      >
                        Bientôt disponible
                      </Button>
                    ) : (
                      <Link href={`/cyber/arcade/${game.id}`}>
                        <Button 
                          className="mt-auto bg-white hover:bg-gray-100 text-gray-900 w-full justify-center"
                          size="sm"
                        >
                          Commencer
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12 text-purple-300 bg-purple-900/20 p-4 rounded-lg"
          >
            <p className="text-sm">
              Tous nos mini-jeux utilisent l'intelligence artificielle pour s'adapter à votre niveau et vous offrir une expérience d'apprentissage sur mesure.
              De nouveaux jeux sont régulièrement ajoutés à notre collection.
            </p>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}