import React, { useState, useCallback } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  TerminalSquare, Target, LockKeyhole, Network, BrainCircuit, Users, Shield, Joystick, 
  ArrowLeft, ArrowRight, Scroll as GraduationCap, Search, FileKey, Bug, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Badge } from '@/components/ui/badge';

interface GameOption {
  id: string;
  title: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  icon: React.ReactNode;
  gradient: string;
  destination: string;
  comingSoon?: boolean;
  isNew?: boolean;
}

export default function CyberArcade() {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  
  // Liste des jeux disponibles
  const games: GameOption[] = [
    {
      id: 'firewall-tactique',
      title: 'Firewall Tactique',
      description: 'Construisez une défense réseau en plaçant des composants de sécurité pour stopper des attaques.',
      difficulty: 'Moyen',
      icon: <Network className="h-8 w-8" />,
      gradient: 'from-blue-600 to-purple-600',
      destination: '/cyber/arcade/firewall-tactique',
      isNew: true
    },
    {
      id: 'code-shield',
      title: 'Code Shield',
      description: 'Créez votre propre antivirus et apprenez à détecter des malwares de plus en plus sophistiqués.',
      difficulty: 'Difficile',
      icon: <Shield className="h-8 w-8" />,
      gradient: 'from-blue-600 to-indigo-700',
      destination: '/cyber/arcade/code-shield'
    },
    {
      id: 'phishing-detective',
      title: 'Phishing Detective',
      description: 'Apprenez à repérer les e-mails frauduleux et les tentatives d\'hameçonnage.',
      difficulty: 'Facile',
      icon: <FileKey className="h-8 w-8" />,
      gradient: 'from-amber-500 to-red-600',
      destination: '/cyber/arcade/phishing-detective',
      comingSoon: true
    },
    {
      id: 'password-guardian',
      title: 'Password Guardian',
      description: 'Comprenez les principes de création de mots de passe sécurisés et les mécanismes des attaques.',
      difficulty: 'Facile',
      icon: <LockKeyhole className="h-8 w-8" />,
      gradient: 'from-green-600 to-emerald-700',
      destination: '/cyber/arcade/password-guardian',
      comingSoon: true
    },
    {
      id: 'cyber-detective',
      title: 'Cyber Detective',
      description: 'Enquêtez sur des incidents de sécurité et identifiez les causes et responsables.',
      difficulty: 'Moyen',
      icon: <Search className="h-8 w-8" />,
      gradient: 'from-indigo-600 to-violet-700',
      destination: '/cyber/arcade/cyber-detective',
      comingSoon: true
    },
    {
      id: 'network-puzzle',
      title: 'Network Puzzle',
      description: 'Reconstituez un réseau sécurisé en plaçant correctement les composants d\'infrastructure.',
      difficulty: 'Moyen',
      icon: <BrainCircuit className="h-8 w-8" />,
      gradient: 'from-cyan-600 to-blue-700',
      destination: '/cyber/arcade/network-puzzle',
      comingSoon: true
    }
  ];
  
  // Catégories de jeux
  const categories = [
    { id: 'all', label: 'Tous les jeux' },
    { id: 'defense', label: 'Défense & Protection' },
    { id: 'detection', label: 'Détection & Analyse' },
    { id: 'investigation', label: 'Investigation' }
  ];
  
  // Filtrer les jeux par catégorie
  const getFilteredGames = useCallback(() => {
    if (currentCategory === 'all') return games;
    
    const categoryMap: Record<string, string[]> = {
      'defense': ['firewall-tactique', 'code-shield', 'password-guardian'],
      'detection': ['phishing-detective', 'network-puzzle'],
      'investigation': ['cyber-detective']
    };
    
    return games.filter(game => categoryMap[currentCategory]?.includes(game.id));
  }, [currentCategory]);
  
  const filteredGames = getFilteredGames();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <HomeLayout>
      <PageTitle title="Cyber Arcade - Jeux et défis" />
      
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
        {/* Arrière-plan cybersécurité simplifiée */}
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
        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* En-tête */}
          <div className="mb-10">
            <div className="flex items-center mb-2">
              <Link href="/cyber">
                <Button variant="ghost" className="text-blue-300 hover:text-blue-100 p-0 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à I AM CYBER
                </Button>
              </Link>
            </div>
            
            <div className="text-center mb-8">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center"
              >
                <Joystick className="h-10 w-10 mr-3 text-blue-400" />
                CYBER ARCADE
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-blue-200 max-w-3xl mx-auto"
              >
                Jeux et défis interactifs pour apprendre la cybersécurité de manière ludique
              </motion.p>
            </div>
          </div>
          
          {/* Filtres par catégorie */}
          <div className="flex justify-center mb-8 gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? "default" : "outline"}
                className={currentCategory === category.id 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-slate-900/60 border-blue-500/20 text-blue-300 hover:bg-blue-900/30 hover:text-blue-100"}
                onClick={() => setCurrentCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          {/* Grille de jeux */}
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredGames.map((game) => (
              <motion.div
                key={game.id}
                variants={itemVariants}
                className="relative overflow-hidden rounded-xl shadow-xl transition-transform duration-300 hover:scale-[1.02]"
              >
                <Link href={game.comingSoon ? "#" : game.destination}>
                  <div 
                    className={`h-full p-6 bg-gradient-to-br ${game.gradient} relative overflow-hidden cursor-pointer ${game.comingSoon ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {/* Points de lumière décoratifs */}
                    <div className="absolute h-24 w-24 -top-10 -right-10 bg-white opacity-20 rounded-full blur-xl"></div>
                    <div className="absolute h-16 w-16 -bottom-8 -left-8 bg-white opacity-20 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                          {game.icon}
                        </div>
                        <div className="space-x-2">
                          <Badge variant="outline" className="border-white/30 text-white font-normal">
                            {game.difficulty}
                          </Badge>
                          {game.isNew && (
                            <Badge className="bg-green-500/80 hover:bg-green-500/80 text-white">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{game.title}</h3>
                      <p className="text-white/80 text-sm flex-grow">{game.description}</p>
                      
                      {game.comingSoon ? (
                        <div className="mt-4 inline-flex border border-white/30 bg-white/10 px-3 py-1.5 rounded-full text-white/80 text-sm items-center">
                          <span>Bientôt disponible</span>
                        </div>
                      ) : (
                        <div className="mt-4 flex justify-between items-center">
                          <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                            Jouer maintenant
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}