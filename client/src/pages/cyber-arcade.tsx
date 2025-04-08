import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  TerminalSquare, Target, LockKeyhole, Network, BrainCircuit, Users, Shield, Joystick, 
  ArrowLeft, ArrowRight, Scroll as GraduationCap, Search, FileKey, Bug, SearchCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

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
    // Jeux existants et fonctionnels - maintenus accessibles
    {
      id: 'password-guardian',
      title: 'Password Guardian',
      description: "Créez des mots de passe que l'IA tentera de déchiffrer. Apprenez les meilleures pratiques de sécurité des mots de passe.",
      difficulty: 'Facile',
      icon: <LockKeyhole className="w-10 h-10 text-white" />,
      gradient: 'from-[#006a9e] to-[#004e78]'
    },
    {
      id: 'network-puzzle',
      title: 'Puzzle Réseau',
      description: "Construisez une infrastructure réseau sécurisée en connectant correctement tous les composants selon les principes de sécurité.",
      difficulty: 'Moyen',
      icon: <Network className="w-10 h-10 text-white" />,
      gradient: 'from-indigo-600 to-indigo-800'
    },
    {
      id: 'codebreaker',
      title: 'Code Breaker',
      description: "Déchiffrez des codes et apprenez les bases de la cryptographie de manière ludique avec des indices progressifs.",
      difficulty: 'Moyen',
      icon: <BrainCircuit className="w-10 h-10 text-white" />,
      gradient: 'from-purple-700 to-purple-900',
      comingSoon: true
    },
    {
      id: 'pca-crisis-mode',
      title: 'PCA Crisis Mode',
      description: "Simulation d'un PCA face à un incident majeur. Coordonnez votre réponse avec DG, RSSI, Communication et Juridique face à un rançongiciel ou une attaque interne.",
      difficulty: 'Difficile',
      icon: <Target className="w-10 h-10 text-white" />,
      gradient: 'from-red-700 to-red-900',
      comingSoon: true
    },
    
    // Nouveaux jeux - Formation et sensibilisation
    {
      id: 'cyber-quiz',
      title: 'Cyber Quiz Challenge',
      description: "Testez vos connaissances en cybersécurité à travers une série de quiz interactifs adaptés à votre niveau. L'IA adapte les questions selon vos réponses.",
      difficulty: 'Facile',
      icon: <GraduationCap className="w-10 h-10 text-white" />,
      gradient: 'from-[#006a9e] to-[#004e78]'
    },
    
    // OSINT
    {
      id: 'osint-investigator',
      title: 'OSINT Investigator',
      description: "Menez l'enquête en utilisant uniquement des sources d'information ouvertes. Découvrez comment les attaquants peuvent exploiter les informations publiques.",
      difficulty: 'Moyen',
      icon: <Search className="w-10 h-10 text-white" />,
      gradient: 'from-blue-600 to-indigo-800',
      comingSoon: true
    },
    
    // Données personnelles
    {
      id: 'personal-data-guardian',
      title: 'Gardien des Données Personnelles',
      description: "Identifiez et protégez les données personnelles dans différents scénarios. Un jeu ludique pour comprendre les enjeux du RGPD.",
      difficulty: 'Facile',
      icon: <FileKey className="w-10 h-10 text-white" />,
      gradient: 'from-[#006a9e] to-[#004e78]',
      comingSoon: true
    },
    
    // Analyse vulnérabilités
    {
      id: 'vulnerability-hunter',
      title: 'Vulnerability Hunter',
      description: "Parcourez un environnement virtuel pour identifier et corriger différentes vulnérabilités de sécurité dans le code et les configurations.",
      difficulty: 'Difficile',
      icon: <Bug className="w-10 h-10 text-white" />,
      gradient: 'from-orange-600 to-red-700',
      comingSoon: true
    },
    
    // Forensics
    {
      id: 'digital-forensics',
      title: 'Digital Detective',
      description: "Menez une investigation numérique pour reconstituer un incident de sécurité. Analysez les preuves numériques et remontez jusqu'à la source de l'attaque.",
      difficulty: 'Difficile',
      icon: <SearchCheck className="w-10 h-10 text-white" />,
      gradient: 'from-indigo-700 to-purple-900',
      comingSoon: true
    },
    
    // Gestion incidents
    {
      id: 'incident-response',
      title: 'Incident Response Challenge',
      description: "Simulation de réponse à incident en temps limité. Identifiez les menaces et rétablissez la sécurité.",
      difficulty: 'Difficile',
      icon: <Target className="w-10 h-10 text-white" />,
      gradient: 'from-red-700 to-rose-900',
      comingSoon: true
    },
    
    // Jeux à remplacer ou à garder pour compléter les 10
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
    }
  ];

  // Mémoisation des cartes de jeux pour éviter les re-rendus inutiles
  const GameCard = React.memo(({ game, index, hoveredGame, setHoveredGame }: { 
    game: GameOption,
    index: number,
    hoveredGame: string | null,
    setHoveredGame: (id: string | null) => void
  }) => (
    <div
      key={game.id}
      className={`relative overflow-hidden rounded-xl shadow-lg transform transition-all duration-300 hover:-translate-y-2 ${game.comingSoon ? 'opacity-70' : 'cursor-pointer hover:shadow-purple-500/30 hover:shadow-xl'}`}
      onMouseEnter={() => setHoveredGame(game.id)}
      onMouseLeave={() => setHoveredGame(null)}
    >
      {/* Suppression du lien invisible pour résoudre le problème de clic */}
      <div className={`bg-gradient-to-br ${game.gradient} p-6 h-full`}>
        {/* Badge de difficulté */}
        <div className={`absolute top-3 right-3 text-xs font-semibold py-1 px-2 rounded-full 
          ${game.difficulty === 'Facile' ? 'bg-blue-600 text-white' : 
            game.difficulty === 'Moyen' ? 'bg-amber-600 text-white' : 
            'bg-rose-600 text-white'}`}
        >
          {game.difficulty}
        </div>
        
        {/* Badge "Bientôt disponible" */}
        {game.comingSoon && (
          <div className="absolute top-12 right-0 bg-gray-800 text-gray-200 text-xs font-semibold py-1 px-2 rotate-45 transform origin-top-right">
            Bientôt disponible
          </div>
        )}
        
        {/* Effet de survol simplifié */}
        {hoveredGame === game.id && !game.comingSoon && (
          <div className="absolute top-4 left-4 bg-purple-500 text-white text-xs font-semibold py-1 px-2 rounded-full">
            Cliquez pour jouer
          </div>
        )}
        
        <div className="flex flex-col h-full">
          <div className="w-16 h-16 rounded-lg bg-black bg-opacity-20 flex items-center justify-center mb-4">
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
            <Button 
              className="mt-auto bg-white hover:bg-gray-100 text-gray-900 w-full justify-center"
              size="sm"
              asChild
            >
              <Link href={`/cyber/arcade/${game.id}`}>
                Commencer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  ));

  return (
    <HomeLayout>
      <PageTitle title="CYBER ARCADE" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-purple-900 via-gray-900 to-black">
        {/* Arrière-plan simplifié */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 z-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Gradient simplifié */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 to-transparent"></div>
        </div>
        
        {/* Contenu principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <Link href="/cyber" className="inline-flex items-center text-purple-200 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à I AM CYBER
          </Link>
          
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <Joystick className="h-10 w-10 text-purple-300 mr-3" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">CYBER ARCADE</h1>
            </div>
            <p className="text-lg text-purple-200 max-w-3xl">
              Testez et améliorez vos compétences en cybersécurité à travers notre collection de mini-jeux interactifs et ludiques.
              L'intelligence artificielle s'adapte à votre niveau pour une expérience d'apprentissage personnalisée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arcadeGames.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                index={index}
                hoveredGame={hoveredGame}
                setHoveredGame={setHoveredGame}
              />
            ))}
          </div>
          
          <div className="text-center mt-12 text-purple-300 bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm">
              Tous nos mini-jeux utilisent l'intelligence artificielle pour s'adapter à votre niveau et vous offrir une expérience d'apprentissage sur mesure.
              De nouveaux jeux sont régulièrement ajoutés à notre collection.
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}