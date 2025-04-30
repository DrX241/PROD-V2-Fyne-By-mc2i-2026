import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameContext } from '@/contexts/cyber-challenge/GameContext';
import { Shield, Cpu, Terminal, Lock, ThumbsUp } from 'lucide-react';

interface IntroductionPhaseProps {
  onComplete: () => void;
}

const IntroductionPhase: React.FC<IntroductionPhaseProps> = ({ onComplete }) => {
  const { username, setUsername } = useGameContext();
  const [formComplete, setFormComplete] = useState(false);

  const handleContinue = () => {
    if (username.trim().length > 0) {
      setFormComplete(true);
    }
  };

  const handleStart = () => {
    onComplete();
  };

  // Animation variants pour les éléments
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-cyan-500" />,
      title: "Défis réalistes",
      description: "Affrontez des scénarios inspirés de véritables incidents de cybersécurité"
    },
    {
      icon: <Cpu className="h-6 w-6 text-cyan-500" />,
      title: "Progression adaptative",
      description: "La difficulté s'adapte à votre niveau et à vos choix"
    },
    {
      icon: <Terminal className="h-6 w-6 text-cyan-500" />,
      title: "Compétences techniques",
      description: "Analysez du code, détectez des vulnérabilités et recommandez des solutions"
    },
    {
      icon: <Lock className="h-6 w-6 text-cyan-500" />,
      title: "Décisions stratégiques",
      description: "Prenez des décisions critiques sous pression avec des conséquences réalistes"
    }
  ];

  return (
    <motion.div 
      className="bg-gray-900 rounded-xl p-6 shadow-lg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {!formComplete ? (
        // Écran d'introduction et formulaire de nom
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="text-center mb-4">
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Bienvenue dans CyberChallenge</h2>
            <p className="text-blue-100">
              L'expérience immersive qui vous met dans la peau d'un professionnel de la cybersécurité
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">{feature.icon}</div>
                  <div>
                    <h3 className="font-medium text-white">{feature.title}</h3>
                    <p className="text-sm text-gray-300">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-medium mb-2">Pour commencer, comment souhaitez-vous être appelé ?</h3>
            <div className="flex space-x-3">
              <Input
                placeholder="Votre nom ou pseudonyme"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <Button onClick={handleContinue} disabled={username.trim().length === 0}>
                Continuer
              </Button>
            </div>
          </motion.div>
        </div>
      ) : (
        // Écran de bienvenue personnalisé
        <motion.div 
          className="space-y-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <div className="bg-cyan-500/20 p-4 rounded-full">
              <ThumbsUp className="h-12 w-12 text-cyan-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white">
            Bienvenue, <span className="text-cyan-400">{username}</span> !
          </h2>
          
          <p className="text-blue-100 max-w-2xl mx-auto">
            Vous êtes sur le point d'entrer dans un monde où vos compétences en cybersécurité 
            seront mises à l'épreuve. Choisissez votre rôle, votre mode de jeu et préparez-vous 
            à affronter des défis inspirés de véritables incidents.
          </p>
          
          <div className="bg-gray-800 p-5 rounded-lg max-w-xl mx-auto">
            <h3 className="text-white font-medium mb-2">Ce qui vous attend :</h3>
            <ul className="text-left text-gray-300 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400">➤</span>
                <span>Des scénarios réalistes avec des enjeux concrets</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400">➤</span>
                <span>Des décisions à prendre sous contrainte de temps</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400">➤</span>
                <span>Des outils interactifs pour résoudre les problèmes</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400">➤</span>
                <span>Une évaluation détaillée de vos performances</span>
              </li>
            </ul>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
            size="lg"
            onClick={handleStart}
          >
            Commencer l'expérience
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default IntroductionPhase;