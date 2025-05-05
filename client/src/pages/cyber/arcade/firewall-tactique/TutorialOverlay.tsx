import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Shield, Network, Lock, Eye } from 'lucide-react';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Effets de transition pour les étapes du tutoriel
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  // Contenus du tutoriel par étape
  const tutorialContent = [
    {
      title: "Bienvenue à Firewall Tactique!",
      icon: <Shield size={48} className="text-blue-500" />,
      content: "Un jeu stratégique où vous protégerez votre réseau contre des cyber-attaques. Placez judicieusement vos défenses pour bloquer les menaces et protéger vos serveurs."
    },
    {
      title: "1. Comprenez le terrain",
      icon: <Network size={48} className="text-green-500" />,
      content: "La grille représente votre réseau. Les points rouges sont vos serveurs à protéger. Le point bleu est la connexion Internet, d'où proviennent les attaques. Les clients en jaune ont besoin d'accéder aux serveurs."
    },
    {
      title: "2. Placez vos défenses",
      icon: <Lock size={48} className="text-purple-500" />,
      content: "Glissez-déposez les composants de sécurité depuis votre inventaire vers la grille. Les pare-feu bloquent les attaques directes, l'authentification sécurise les accès, la segmentation isole les zones, et la surveillance détecte les intrusions."
    },
    {
      title: "3. Stratégie et combinaisons",
      icon: <Eye size={48} className="text-orange-500" />,
      content: "Combinez les défenses intelligemment! Un pare-feu près d'un système d'authentification est plus efficace. La défense en profondeur est essentielle: utilisez plusieurs lignes de défense avec des technologies complémentaires."
    },
    {
      title: "Prêt à défendre votre réseau?",
      icon: <Shield size={48} className="text-blue-500" />,
      content: "Commencez par placer vos défenses, puis lancez la simulation d'attaque pour voir comment votre stratégie résiste. Après chaque tentative, vous recevrez une analyse détaillée et des conseils pour vous améliorer."
    }
  ];

  const currentTutorial = tutorialContent[step - 1];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6 relative"
      >
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Fermer le tutoriel"
        >
          <X size={24} />
        </button>

        {/* Indicateur d'étapes */}
        <div className="flex justify-center mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index}
              className={`h-2 w-8 mx-1 rounded-full ${index + 1 === step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            />
          ))}
        </div>

        {/* Contenu du tutoriel */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-8"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-4">
                {currentTutorial.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {currentTutorial.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {currentTutorial.content}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Boutons de navigation */}
        <div className="flex justify-between">
          <button 
            onClick={prevStep}
            className={`flex items-center px-4 py-2 rounded-md ${
              step === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-gray-700'
            }`}
            disabled={step === 1}
          >
            <ChevronLeft size={20} className="mr-1" />
            Précédent
          </button>

          <button 
            onClick={nextStep}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {step === totalSteps ? 'Commencer' : 'Suivant'}
            {step !== totalSteps && <ChevronRight size={20} className="ml-1" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TutorialOverlay;