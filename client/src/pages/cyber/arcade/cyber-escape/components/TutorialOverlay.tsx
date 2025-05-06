import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { 
  ArrowRight, 
  ArrowLeft, 
  LogOut, 
  MousePointer, 
  MessageCircle, 
  Users, 
  Check, 
  X 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TutorialStep {
  title: string;
  description: string;
  image?: string;
  highlight?: 'room' | 'character' | 'conversation' | 'choices' | 'points' | 'navigation';
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Bienvenue sur CYBER ESCAPE",
    description: "Avant de commencer, nous allons vous guider à travers les bases du jeu en quelques étapes simples.",
  },
  {
    title: "1. Sélectionnez une salle",
    description: "Commencez par naviguer dans l'entreprise en cliquant sur les différentes salles. Chaque salle contient des personnages avec lesquels interagir.",
    highlight: 'room'
  },
  {
    title: "2. Interagissez avec les personnages",
    description: "Dans chaque salle, vous trouverez des personnages. Cliquez sur un personnage pour démarrer une conversation et découvrir des problèmes de sécurité potentiels.",
    highlight: 'character'
  },
  {
    title: "3. Choisissez des sujets de conversation",
    description: "Cliquez sur les différents sujets pour approfondir la conversation et obtenir plus d'informations sur les pratiques de sécurité du personnage.",
    highlight: 'conversation'
  },
  {
    title: "4. Faites les bons choix",
    description: "Pendant la conversation, on vous demandera de faire des choix. Choisissez les réponses qui correspondent aux meilleures pratiques de sécurité pour gagner des points.",
    highlight: 'choices'
  },
  {
    title: "5. Surveillez votre score",
    description: "Votre score de sécurité est affiché dans la barre latérale. Les bonnes décisions augmentent votre score, les mauvaises décisions le diminuent. Si votre score devient négatif, la partie est perdue.",
    highlight: 'points'
  },
  {
    title: "6. Utilisez la navigation",
    description: "Utilisez la barre latérale pour accéder à l'accueil, voir vos récompenses, ou obtenir de l'aide à tout moment.",
    highlight: 'navigation'
  },
  {
    title: "Prêt à jouer !",
    description: "Vous connaissez maintenant les bases ! Votre mission commence : repérez les comportements à risque, donnez les bons conseils et améliorez la posture de sécurité de l'entreprise. Bonne chance !",
  }
];

interface TutorialOverlayProps {
  onClose: () => void;
}

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [closing, setClosing] = useState(false);
  
  const totalSteps = tutorialSteps.length;
  
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  const step = tutorialSteps[currentStep];
  
  const getHighlightPosition = () => {
    switch (step.highlight) {
      case 'room':
        return 'top-1/4 left-1/2 transform -translate-x-1/2';
      case 'character':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'conversation':
        return 'top-1/2 right-1/4';
      case 'choices':
        return 'bottom-1/3 left-1/2 transform -translate-x-1/2';
      case 'points':
        return 'top-1/4 left-20';
      case 'navigation':
        return 'top-1/2 left-10 transform -translate-y-1/2';
      default:
        return '';
    }
  };
  
  return (
    <div className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Illustration de la fonctionnalité mise en évidence */}
      {step.highlight && (
        <div className={`absolute ${getHighlightPosition()} animate-pulse`}>
          <div className="h-16 w-16 rounded-full bg-blue-500/50 flex items-center justify-center">
            <MousePointer className="h-8 w-8 text-white" />
          </div>
        </div>
      )}
      
      <Card className="w-full max-w-md bg-blue-950 border-blue-700 shadow-xl mx-4">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{step.title}</CardTitle>
          <CardDescription className="text-blue-300">
            Étape {currentStep + 1} sur {totalSteps}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-white">{step.description}</p>
          
          {/* Illustration spécifique à l'étape */}
          {step.highlight === 'choices' && (
            <div className="mt-4 p-3 bg-blue-900/50 rounded-lg border border-blue-700">
              <div className="text-sm font-semibold mb-2">Exemple de choix :</div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-left bg-blue-800/50 hover:bg-blue-700/70 flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                  <span>Recommander l'utilisation de l'authentification à deux facteurs</span>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left bg-blue-800/50 hover:bg-blue-700/70 flex items-center">
                  <X className="mr-2 h-4 w-4 text-red-400" />
                  <span>Dire que les mots de passe simples sont suffisants</span>
                </Button>
              </div>
            </div>
          )}
          
          {step.highlight === 'room' && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-blue-900/50 p-2 rounded-lg border border-blue-700 text-center">
                <div className="text-sm font-semibold">Lobby</div>
              </div>
              <div className="bg-blue-900/50 p-2 rounded-lg border border-blue-700 text-center">
                <div className="text-sm font-semibold">Bureau IT</div>
              </div>
            </div>
          )}
          
          {step.highlight === 'character' && (
            <div className="mt-4 p-3 bg-blue-900/50 rounded-lg border border-blue-700 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center mr-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Employé</div>
                <div className="text-xs text-blue-300">Service IT</div>
              </div>
            </div>
          )}
          
          {step.highlight === 'conversation' && (
            <div className="mt-4 p-3 bg-blue-900/50 rounded-lg border border-blue-700 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-400" />
              <div className="text-sm">Politique de mots de passe</div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose}>
              {currentStep === totalSteps - 1 ? "Fermer" : "Ignorer"}
            </Button>
            
            {currentStep < totalSteps - 1 ? (
              <Button onClick={nextStep}>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleClose}>
                Commencer
                <LogOut className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TutorialOverlay;