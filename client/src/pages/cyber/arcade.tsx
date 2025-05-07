import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Button } from '@/components/ui/button';
import { Search, FileSearch, ArrowLeft, Fingerprint, HardDrive, Shield, Network, Brain } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  available: boolean;
  comingSoon?: boolean;
  route: string;
}

export default function CyberArcade() {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);

  const games: Game[] = [
    {
      id: 'cyber-escape-parefeu',
      title: 'CYBER ESCAPE: LE PARE-FEU EST TOMBÉ',
      description: 'Gérez une crise cyber en tant que RSSI. Un malware a compromis le système, retrouvez les indices et résolvez les énigmes en temps limité',
      icon: <HardDrive className="w-6 h-6" />,
      gradient: 'from-red-700 to-orange-700',
      available: true,
      route: '/cyber/arcade/cyber-escape-parefeu'
    },
    {
      id: 'brain-hacker',
      title: 'BRAIN HACKER',
      description: 'Ingénierie sociale inversée : incarnez le hacker et trouvez le moyen le plus subtil de piéger la victime',
      icon: <Brain className="w-6 h-6" />,
      gradient: 'from-fuchsia-500 to-purple-800',
      available: true,
      route: '/cyber/arcade/brain-hacker'
    },
    {
      id: 'firewall-tactique',
      title: 'FIREWALL TACTIQUE',
      description: 'Construisez une défense réseau en plaçant des composants de sécurité pour stopper des attaques',
      icon: <Network className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-700',
      available: true,
      route: '/cyber/arcade/firewall-tactique'
    },
    {
      id: 'code-shield',
      title: 'CODE SHIELD',
      description: 'Créez votre propre antivirus et protégez le système contre les malwares',
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-blue-600 to-blue-900',
      available: true,
      route: '/cyber/arcade/code-shield'
    },
    {
      id: 'cyber-investigator',
      title: 'CYBER INVESTIGATEUR',
      description: 'Résolvez des enquêtes sur des incidents de cybersécurité et identifiez les responsables',
      icon: <Search className="w-6 h-6" />,
      gradient: 'from-indigo-600 to-indigo-900',
      available: true,
      route: '/cyber/arcade/cyber-investigator'
    },
    {
      id: 'digital-forensics',
      title: 'ANALYSE FORENSIQUE',
      description: 'Analysez des preuves numériques pour reconstruire la chronologie d\'attaques sophistiquées',
      icon: <Fingerprint className="w-6 h-6" />,
      gradient: 'from-emerald-600 to-emerald-900',
      available: true,
      route: '/cyber/arcade/digital-forensics'
    },
    {
      id: 'threat-intelligence',
      title: 'MENACES AVANCÉES',
      description: 'Traquez des acteurs malveillants grâce à l\'analyse de renseignements sur les menaces',
      icon: <Shield className="w-6 h-6" />,
      gradient: 'from-purple-600 to-purple-900',
      available: true,
      route: '/cyber/arcade/threat-intelligence'
    }
  ];

  return (
    <HomeLayout>
      <PageTitle title="CYBER ARCADE" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900">
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center mb-8">
            <Link href="/cyber">
              <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Cyber Arcade</h1>
          </div>

          <p className="text-lg text-blue-200 max-w-3xl mb-10">
            Bienvenue dans le Cyber Arcade ! Améliorez vos compétences en cybersécurité avec ces jeux interactifs 
            et ludiques conçus pour tous les niveaux. Choisissez un jeu pour commencer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden shadow-xl rounded-xl"
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
              >
                <Link href={game.route}>
                  <div className={`bg-gradient-to-br ${game.gradient} p-6 h-full min-h-[220px] flex flex-col relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:shadow-2xl`}>
                    {/* Glow effect on hover */}
                    {hoveredGame === game.id && (
                      <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                    )}

                    <div className="flex items-center mb-4">
                      <div className="bg-white/10 p-2 rounded-lg mr-3">
                        {game.icon}
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {game.title}
                      </h2>
                    </div>

                    <p className="text-blue-100 text-sm mb-4 flex-grow">
                      {game.description}
                    </p>

                    <div className="flex justify-end mt-2">
                      <Button
                        variant="ghost"
                        className="bg-white/10 hover:bg-white/20 py-1.5 px-4 rounded-lg text-white text-sm font-medium"
                        disabled={game.comingSoon}
                      >
                        {game.comingSoon ? "Bientôt disponible" : "Jouer maintenant"}
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}