import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, LightbulbIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  image?: string;
  highlight?: string;
}

interface TutorialOverlayProps {
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Étapes du tutoriel
  const tutorialSteps: TutorialStep[] = [
    {
      title: "Bienvenue dans Firewall Tactique",
      content: (
        <div className="space-y-2">
          <p>Ce jeu vous permet d'apprendre les principes de la sécurité réseau de façon interactive.</p>
          <p>Vous allez construire une architecture de défense pour protéger vos serveurs contre différentes cyber-attaques.</p>
        </div>
      ),
      highlight: "all"
    },
    {
      title: "Comprendre les menaces",
      content: (
        <div className="space-y-2">
          <p>Pour chaque niveau, des menaces spécifiques sont identifiées.</p>
          <p>Examinez attentivement les types d'attaques prévues pour préparer une défense adaptée.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-amber-700/20 text-amber-500 px-2 py-1 rounded text-xs">Attaque par force brute</span>
            <span className="bg-red-700/20 text-red-500 px-2 py-1 rounded text-xs">Malware</span>
            <span className="bg-purple-700/20 text-purple-500 px-2 py-1 rounded text-xs">Déni de service</span>
          </div>
        </div>
      ),
      highlight: "threats"
    },
    {
      title: "Composants de sécurité",
      content: (
        <div className="space-y-2">
          <p>Sélectionnez différents composants de sécurité dans la liste pour les ajouter à votre architecture.</p>
          <p>Chaque composant a:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-green-400">Puissance</span> - Efficacité contre certaines attaques</li>
            <li><span className="text-amber-400">Coût</span> - Impact sur votre budget limité</li>
            <li><span className="text-blue-400">Compatibilités</span> - Combinaisons avec d'autres composants</li>
          </ul>
        </div>
      ),
      highlight: "components"
    },
    {
      title: "Placement stratégique",
      content: (
        <div className="space-y-2">
          <p>Cliquez sur un composant pour le sélectionner, puis placez-le sur la grille en cliquant sur une case vide.</p>
          <p>Le placement est stratégique:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Placez les pare-feu entre Internet et vos serveurs</li>
            <li>Ajoutez des composants compatibles à proximité (+2 points)</li>
            <li>Créez plusieurs couches de défense</li>
          </ul>
        </div>
      ),
      highlight: "grid"
    },
    {
      title: "Élements de la grille",
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-900/40 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
              </div>
              <span>Internet (menaces)</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-900/40 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
              </div>
              <span>Postes clients</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-900/40 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
              </div>
              <span>Serveurs (à protéger)</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-900/40 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <span>Vos composants</span>
            </div>
          </div>
        </div>
      ),
      highlight: "grid"
    },
    {
      title: "Simulations d'attaques",
      content: (
        <div className="space-y-2">
          <p>Une fois votre architecture prête, lancez la simulation pour voir si elle résiste aux attaques.</p>
          <p>La simulation va:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tester chaque type d'attaque contre votre défense</li>
            <li>Évaluer l'efficacité de chaque composant</li>
            <li>Calculer un score global de sécurité</li>
            <li>Fournir des recommandations d'amélioration</li>
          </ul>
        </div>
      ),
      highlight: "simulation"
    },
    {
      title: "Conseil d'expert",
      content: (
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <LightbulbIcon className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white"><strong>Défense en profondeur</strong> : Ne vous fiez pas à un seul composant!</p>
              <p className="text-sm text-indigo-200 mt-1">Combinez plusieurs couches de protection pour une sécurité optimale. Les attaquants réels chercheront toujours le maillon faible de votre architecture.</p>
            </div>
          </div>
        </div>
      ),
      highlight: "none"
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={`tutorial-step-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-slate-900/95 border border-indigo-500/30">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-indigo-400 mr-2" />
                    <CardTitle className="text-white text-xl">{tutorialSteps[currentStep].title}</CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-indigo-100">
                  {tutorialSteps[currentStep].content}
                </div>
              </CardContent>
              <CardFooter className="border-t border-indigo-500/20 pt-4 flex justify-between">
                <div className="text-sm text-indigo-300">
                  Étape {currentStep + 1} / {tutorialSteps.length}
                </div>
                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={prevStep}
                      className="border-indigo-600 text-indigo-200 hover:bg-indigo-950/50"
                    >
                      Précédent
                    </Button>
                  )}
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={nextStep}
                  >
                    {currentStep < tutorialSteps.length - 1 ? (
                      <>
                        Suivant
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : 'Commencer à jouer'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TutorialOverlay;