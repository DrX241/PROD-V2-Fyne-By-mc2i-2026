import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Zap,
  Workflow,
  AlertTriangle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useGameContext } from '@/contexts/cyber-challenge/GameContext';
import type { GameMode } from '@/contexts/cyber-challenge/GameContext';

interface GameModePhaseProps {
  onComplete: () => void;
}

const GameModePhase: React.FC<GameModePhaseProps> = ({ onComplete }) => {
  const { selectedMode, setSelectedMode, difficultyLevel, setDifficultyLevel } = useGameContext();

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleContinue = () => {
    if (selectedMode) {
      onComplete();
    }
  };

  // Données des modes de jeu
  const gameModes = [
    {
      id: 'classic' as GameMode,
      title: 'Mode Classique',
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      description: 'Résolvez une série de défis cybersécurité indépendants adaptés à votre rôle.',
      features: [
        '4 scénarios aléatoires',
        'Difficulté progressive',
        'Évaluation à la fin de chaque scénario',
        'Temps limité par scénario',
      ],
      footerText: 'Idéal pour une première expérience ou des sessions courtes',
    },
    {
      id: 'tunnel' as GameMode,
      title: 'Mode Tunnel',
      icon: <Workflow className="h-8 w-8 text-blue-400" />,
      description: 'Affrontez une chaîne d\'incidents interconnectés dont les conséquences se propagent.',
      features: [
        'Scénarios liés entre eux',
        'Les décisions influencent les scénarios suivants',
        'Incidents qui s\'intensifient',
        'Communication avec les équipes virtuelles',
      ],
      footerText: 'Pour une expérience immersive et réaliste',
    }
  ];

  // Options de difficulté
  const difficultyOptions = [
    {
      id: 'beginner',
      title: 'Débutant',
      icon: <Clock className="h-5 w-5 text-green-400" />,
      description: 'Pour les nouveaux dans le domaine de la cybersécurité',
    },
    {
      id: 'intermediate',
      title: 'Intermédiaire',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      description: 'Pour ceux ayant une expérience modérée en cybersécurité',
    },
    {
      id: 'advanced',
      title: 'Avancé',
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      description: 'Pour les professionnels expérimentés en cybersécurité',
    }
  ];

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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Mode de jeu et difficulté</h2>
        <p className="text-blue-100">
          Choisissez le mode qui correspond à l'expérience que vous recherchez
        </p>
      </motion.div>

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sélection du mode de jeu */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-white mb-3">Mode de jeu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameModes.map((mode) => (
              <div
                key={mode.id}
                className={`cursor-pointer border rounded-lg p-4 transition-all ${selectedMode === mode.id 
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-cyan-400' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-gray-700 p-2 rounded-lg">
                    {mode.icon}
                  </div>
                  <h4 className="text-xl font-bold text-white">{mode.title}</h4>
                </div>
                
                <p className="text-gray-300 mb-4 text-sm">
                  {mode.description}
                </p>
                
                <ul className="space-y-2 mb-4">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <ChevronRight className="h-4 w-4 text-cyan-400 mr-2 mt-0.5" />
                      <span className="text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-xs text-gray-500 italic mt-auto">
                  {mode.footerText}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sélection de la difficulté */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-white mb-3">Niveau de difficulté</h3>
          <div className="flex flex-wrap gap-3">
            {difficultyOptions.map((option) => (
              <button
                key={option.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  difficultyLevel === option.id 
                    ? 'bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-cyan-400' 
                    : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                }`}
                onClick={() => setDifficultyLevel(option.id as any)}
              >
                {option.icon}
                <span className="text-white">{option.title}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {difficultyOptions.find(option => option.id === difficultyLevel)?.description}
          </p>
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex justify-end mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
          onClick={handleContinue}
          disabled={!selectedMode}
        >
          Lancer le scénario
        </Button>
      </motion.div>
    </div>
  );
};

export default GameModePhase;