import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Joyride, { STATUS, CallBackProps, Step, ACTIONS } from 'react-joyride';

interface TutorialContextType {
  showTutorial: boolean;
  startTutorial: () => void;
  stopTutorial: () => void;
  setCurrentTour: (tourName: string) => void;
  currentTour: string | null;
  tutorialSeen: Record<string, boolean>;
}

interface TutorialProviderProps {
  children: ReactNode;
}

// Création du contexte avec des valeurs par défaut
const TutorialContext = createContext<TutorialContextType>({
  showTutorial: false,
  startTutorial: () => {},
  stopTutorial: () => {},
  setCurrentTour: () => {},
  currentTour: null,
  tutorialSeen: {},
});

// Étapes du tutoriel pour chaque page
const tourSteps: Record<string, Step[]> = {
  'cyber-mode-selection': [
    {
      target: 'body',
      content: 'Bienvenue dans I AM CYBER ! Découvrez notre plateforme dédiée à la formation en cybersécurité.',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: '[data-id="cyber-trainer"]',
      content: 'La section CYBERTRAINER vous permet d\'apprendre la cybersécurité de manière interactive avec notre IA experte ou via des mini-jeux pédagogiques.',
      disableBeacon: true,
    },
    {
      target: '[data-id="cyber-ops"]',
      content: 'CYBEROPS propose des scénarios réalistes pour vous entraîner et réagir comme un professionnel face à des incidents de sécurité.',
      disableBeacon: true,
    },
    {
      target: '[data-id="cyber-test"]',
      content: 'Testez vos connaissances avec CYBERTEST grâce à des modes d\'entretien et des tests techniques.',
      disableBeacon: true,
    },
    {
      target: '[data-id="cyber-tools"]',
      content: 'CYBERTOOLS met à votre disposition des outils pratiques d\'automatisation pour créer et transformer des documents de sécurité.',
      disableBeacon: true,
    },
    {
      target: '[data-id="cyber-ascension"]',
      content: 'CYBERASCENSION est un programme complet de formation pour réussir les certifications en cybersécurité.',
      disableBeacon: true,
    },
  ],
  'cyber-mode-selection-redesign': [
    {
      target: 'body',
      content: '🚀 Bienvenue dans I AM CYBER - votre centre d\'excellence en cybersécurité ! Cette interface a été entièrement repensée pour vous offrir une expérience d\'apprentissage sur mesure. Suivez ce guide pour découvrir toutes les fonctionnalités à votre disposition.',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: '[data-id="help-button"]',
      content: '❓ Le bouton d\'aide est votre meilleur allié. Un clic ici et ce guide réapparaîtra à tout moment si vous vous sentez perdu ou avez besoin de vous rappeler où se trouve une fonctionnalité.',
      disableBeacon: true,
    },
    {
      target: '[data-id="contrast-button"]',
      content: '🔆 Le mode haut contraste améliore considérablement la lisibilité pour les personnes ayant des difficultés visuelles. Essayez-le pour voir la différence !',
      disableBeacon: true,
    },
    {
      target: '[data-id="text-smaller-button"]',
      content: '🔍 Si le texte vous semble trop grand, utilisez ce bouton pour le réduire. Personnalisez l\'interface selon vos préférences visuelles.',
      disableBeacon: true,
    },
    {
      target: '[data-id="text-larger-button"]',
      content: '🔎 Besoin d\'un texte plus lisible ? Ce bouton augmente la taille de tous les textes de l\'interface pour un confort de lecture optimal.',
      disableBeacon: true,
    },
    {
      target: '[data-id="main-title"]',
      content: '✨ Voici le cœur de I AM CYBER ! Cette plateforme d\'apprentissage personnalisée vous accompagne dans votre montée en compétences en cybersécurité, adaptée à votre niveau et vos objectifs professionnels.',
      disableBeacon: true,
    },
    {
      target: '[data-id="main-tabs"]',
      content: '📑 Les onglets principaux vous permettent d\'organiser votre parcours d\'apprentissage selon différentes perspectives. Choisissez celle qui vous convient le mieux !',
      disableBeacon: true,
    },
    {
      target: '[data-id="objectives-tab"]',
      content: '🎯 L\'onglet "Par objectif d\'apprentissage" organise les modules selon vos intentions : voulez-vous acquérir de nouvelles connaissances, mettre en pratique vos compétences, tester votre niveau ou créer vos propres contenus ?',
      disableBeacon: true,
    },
    {
      target: '[data-id="careers-tab"]',
      content: '💼 L\'onglet "Par métier" présente des parcours spécifiquement conçus pour différentes spécialités en cybersécurité : gouvernance, sécurité opérationnelle, test d\'intrusion, et bien d\'autres encore.',
      disableBeacon: true,
    },
    {
      target: '[data-id="all-modules-tab"]',
      content: '🧩 L\'onglet "Tous les modules" vous donne une vue d\'ensemble de toutes les ressources disponibles, avec des options de filtrage et de tri avancées pour trouver exactement ce dont vous avez besoin.',
      disableBeacon: true,
    },
    {
      target: '[data-id="objective-se-former"]',
      content: '📚 La catégorie "SE FORMER" regroupe tous les modules d\'apprentissage théorique, comme les tutoriels, documentations et formations sur les concepts fondamentaux de la cybersécurité.',
      disableBeacon: true,
    },
    {
      target: '[data-id="objective-sentrainer"]',
      content: '🏋️ La catégorie "S\'ENTRAÎNER" propose des activités pratiques et des simulations pour mettre en application vos connaissances dans des environnements réalistes et sécurisés.',
      disableBeacon: true,
    },
    {
      target: '[data-id="objective-sevaluer"]',
      content: '📊 La catégorie "S\'ÉVALUER" vous permet de tester vos compétences et de mesurer votre progression grâce à des quiz, des examens et des défis techniques chronométrés.',
      disableBeacon: true,
    },
    {
      target: '[data-id="search-input"]',
      content: '🔍 La barre de recherche est votre raccourci vers n\'importe quel module. Tapez un mot-clé ou un nom de module pour le trouver instantanément, sans avoir à parcourir toutes les catégories.',
      disableBeacon: true,
    },
    {
      target: '[data-id="beginner-filter"]',
      content: '🏷️ Les filtres de difficulté vous permettent d\'affiner les modules selon votre niveau d\'expertise. Vous pouvez sélectionner plusieurs niveaux simultanément pour élargir ou restreindre votre sélection.',
      disableBeacon: true,
    },
    {
      target: '[data-id="grid-view-button"]',
      content: '📱 Changez l\'affichage entre la vue en grille (plus visuelle) et la vue en liste (plus détaillée) selon vos préférences ou le type d\'appareil que vous utilisez.',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: '🎉 Félicitations ! Vous êtes maintenant prêt à explorer I AM CYBER et à développer vos compétences en cybersécurité. N\'oubliez pas que le bouton d\'aide est toujours disponible si vous avez besoin de revoir ce guide. Bonne exploration !',
      disableBeacon: true,
      placement: 'center',
    },
  ],
};

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState<Record<string, boolean>>({});

  // Charger les tutoriels déjà vus depuis le localStorage
  useEffect(() => {
    const seenTutorials = localStorage.getItem('tutorialSeen');
    if (seenTutorials) {
      setTutorialSeen(JSON.parse(seenTutorials));
    }
  }, []);

  // Gestionnaire de callback pour le tutoriel
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, type } = data;

    // Quand le tutoriel est terminé ou fermé
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any) || 
        [ACTIONS.CLOSE].includes(action as any)) {
      setShowTutorial(false);
      
      // Enregistrer que l'utilisateur a vu ce tutoriel
      if (currentTour) {
        const updatedTutorialSeen = { ...tutorialSeen, [currentTour]: true };
        setTutorialSeen(updatedTutorialSeen);
        localStorage.setItem('tutorialSeen', JSON.stringify(updatedTutorialSeen));
      }
    }
  };

  // Démarrer le tutoriel
  const startTutorial = () => {
    setShowTutorial(true);
  };

  // Arrêter le tutoriel
  const stopTutorial = () => {
    setShowTutorial(false);
  };

  // Steps pour le tutoriel actuel
  const currentSteps = currentTour ? tourSteps[currentTour] || [] : [];

  return (
    <TutorialContext.Provider 
      value={{ 
        showTutorial, 
        startTutorial, 
        stopTutorial, 
        setCurrentTour,
        currentTour,
        tutorialSeen
      }}
    >
      <Joyride
        steps={currentSteps}
        run={showTutorial}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#3B82F6', // blue-500
            backgroundColor: '#1E293B', // slate-800
            textColor: '#F8FAFC', // slate-50
            arrowColor: '#1E293B', // slate-800
            overlayColor: 'rgba(0, 0, 0, 0.7)'
          },
          tooltip: {
            fontSize: '15px',
            padding: '15px'
          },
          buttonBack: {
            color: '#94A3B8' // slate-400
          },
          buttonNext: {
            backgroundColor: '#3B82F6' // blue-500
          },
          buttonSkip: {
            color: '#94A3B8' // slate-400
          }
        }}
        locale={{
          back: 'Précédent',
          close: 'Fermer',
          last: 'Terminer',
          next: 'Suivant',
          skip: 'Ignorer'
        }}
      />
      {children}
    </TutorialContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useTutorial = () => useContext(TutorialContext);