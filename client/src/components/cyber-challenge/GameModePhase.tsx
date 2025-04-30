import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Target, Timer, FileText, Code, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame, type GameMode } from '@/contexts/cyber-challenge/GameContext';

interface GameModePhaseProps {
  onComplete: () => void;
}

interface GameModeOption {
  id: GameMode;
  title: string;
  color: string;
  gradient: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  difficulty: 'Facile' | 'Modéré' | 'Difficile' | 'Expert';
}

export default function GameModePhase({ onComplete }: GameModePhaseProps) {
  const { selectMode, selectedRole } = useGame();
  const [selectedModeId, setSelectedModeId] = useState<GameMode | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Définition des modes de jeu disponibles
  const gameModes: GameModeOption[] = [
    {
      id: 'classic-challenge',
      title: 'Défi Classique',
      color: 'blue',
      gradient: 'from-blue-600 to-blue-900',
      icon: <Target className="h-10 w-10 text-blue-400" />,
      description: 'Une série de 15 défis progressifs adaptés à votre rôle pour tester vos connaissances en cybersécurité.',
      features: [
        'Variété de défis adaptés à votre rôle',
        'Évaluation détaillée après chaque niveau',
        'Système de points pour mesurer la progression',
        'Défis techniques et pratiques'
      ],
      difficulty: 'Modéré'
    },
    {
      id: 'tunnel-effect',
      title: 'Effet Tunnel',
      color: 'purple',
      gradient: 'from-purple-600 to-purple-900',
      icon: <Timer className="h-10 w-10 text-purple-400" />,
      description: 'Mode chronométré avec 10 questions rapides où chaque décision influence la suite du scénario.',
      features: [
        '30 secondes par décision',
        'Évolution dynamique du scénario',
        'Conséquences immédiates des choix',
        'Pression du temps réel'
      ],
      difficulty: 'Difficile'
    },
    {
      id: 'pca-scenario',
      title: 'Scénario PCA',
      color: 'orange',
      gradient: 'from-orange-600 to-orange-900',
      icon: <FileText className="h-10 w-10 text-orange-400" />,
      description: 'Simulation complète d\'une crise de cybersécurité avec gestion d\'équipe et de budget.',
      features: [
        'Interactions avec multiples personnages IA',
        'Gestion d\'un budget de 400 000 €',
        'Décisions à impact juridique et organisationnel',
        'Scénario adaptatif selon vos choix'
      ],
      difficulty: 'Expert'
    },
    {
      id: 'hackathon',
      title: 'Hackathon Cyber',
      color: 'green',
      gradient: 'from-green-600 to-green-900',
      icon: <Code className="h-10 w-10 text-green-400" />,
      description: 'Enquête de cybersécurité où vous devez retrouver 10 indices cachés dans divers contenus numériques.',
      features: [
        'Analyse de fichiers, emails et logs',
        'Découverte progressive d\'indices',
        'Environnement de travail réaliste',
        'Défi de résolution d\'énigmes'
      ],
      difficulty: 'Facile'
    }
  ];

  // Sélectionner un mode de jeu
  const handleModeSelection = (mode: GameMode) => {
    setSelectedModeId(mode);
    selectMode(mode);
    setShowDetails(true);
  };

  // Confirmer la sélection et passer à l'étape suivante
  const confirmSelection = () => {
    if (selectedModeId) {
      onComplete();
    }
  };

  // Obtenir le mode sélectionné
  const selectedMode = gameModes.find(mode => mode.id === selectedModeId);

  // Map de couleurs pour les badges de difficulté
  const difficultyColors: Record<string, string> = {
    'Facile': 'bg-green-600 hover:bg-green-700',
    'Modéré': 'bg-blue-600 hover:bg-blue-700',
    'Difficile': 'bg-orange-600 hover:bg-orange-700',
    'Expert': 'bg-red-600 hover:bg-red-700'
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Choisissez votre mode de jeu
        </h2>
        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
          Sélectionnez le type d'expérience que vous souhaitez vivre en tant que {" "}
          <span className="font-bold text-cyan-300">
            {selectedRole === 'rssi' && 'RSSI'}
            {selectedRole === 'ethical-hacker' && 'Hacker Éthique'}
            {selectedRole === 'soc-analyst' && 'Analyste SOC'}
            {selectedRole === 'secure-developer' && 'Développeur Sécurisé'}
            {selectedRole === 'cybersecurity-consultant' && 'Consultant Cybersécurité'}
            {selectedRole === 'system-administrator' && 'Administrateur Système'}
            {selectedRole === 'cyber-legal' && 'Juriste Cybersécurité'}
            {selectedRole === 'financial-director' && 'Directeur Financier'}
          </span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
        {gameModes.map((mode) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: gameModes.indexOf(mode) * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              onClick={() => handleModeSelection(mode.id)}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-300
                bg-gradient-to-br ${mode.gradient} border border-${mode.color}-500/30
                hover:border-${mode.color}-400/60 p-6
                ${selectedModeId === mode.id ? `ring-2 ring-${mode.color}-400 ring-offset-2 ring-offset-blue-900` : ''}
              `}
            >
              <div className="absolute top-0 right-0 p-2">
                <Badge className={difficultyColors[mode.difficulty]}>
                  {mode.difficulty}
                </Badge>
              </div>
              <div className="flex items-center mb-4">
                <div className={`rounded-full bg-${mode.color}-900/50 p-3`}>
                  {mode.icon}
                </div>
                <h3 className="text-xl font-bold ml-4 text-white">{mode.title}</h3>
              </div>
              <p className="text-blue-100 mb-4">{mode.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-200">
                  {selectedModeId === mode.id ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1 text-cyan-400" />
                      Sélectionné
                    </span>
                  ) : 'Cliquez pour sélectionner'}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {showDetails && selectedMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl mx-auto rounded-lg p-6 border border-blue-500/50 bg-gradient-to-r from-blue-900/50 to-purple-900/50"
        >
          <h3 className="text-2xl font-bold mb-4 text-white flex items-center">
            {selectedMode.icon}
            <span className="ml-3">{selectedMode.title}</span>
          </h3>
          
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-200 mb-2">Caractéristiques :</h4>
            <ul className="space-y-2">
              {selectedMode.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span className="text-blue-100">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={confirmSelection}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              Lancer le {selectedMode.title}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}