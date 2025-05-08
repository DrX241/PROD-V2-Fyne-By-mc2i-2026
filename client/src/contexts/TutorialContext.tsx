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
      content: 'Bienvenue dans la nouvelle interface d\'I AM CYBER ! Découvrez notre approche entièrement repensée pour rendre l\'apprentissage de la cybersécurité plus accessible et personnalisé.',
      disableBeacon: true,
      placement: 'center',
    },
    {
      target: '[data-id="help-button"]',
      content: 'Ce bouton d\'aide vous permet de réafficher ce tutoriel à tout moment si vous avez besoin d\'assistance.',
      disableBeacon: true,
    },
    {
      target: '[data-id="contrast-button"]',
      content: 'Activez le mode haut contraste pour améliorer la lisibilité, particulièrement utile pour les personnes malvoyantes.',
      disableBeacon: true,
    },
    {
      target: '[data-id="text-smaller-button"]',
      content: 'Réduisez la taille du texte si celui-ci est trop grand.',
      disableBeacon: true,
    },
    {
      target: '[data-id="text-larger-button"]',
      content: 'Augmentez la taille du texte pour un meilleur confort de lecture.',
      disableBeacon: true,
    },
    {
      target: '[data-id="main-title"]',
      content: 'Bienvenue dans I AM CYBER, votre plateforme d\'apprentissage personnalisée pour la cybersécurité.',
      disableBeacon: true,
    },
    {
      target: '[data-id="main-tabs"]',
      content: 'Vous pouvez naviguer entre différentes vues : par objectif d\'apprentissage, par métier, ou voir tous les modules.',
      disableBeacon: true,
    },
    {
      target: '[data-id="objectives-tab"]',
      content: 'Cette vue organise les modules selon ce que vous souhaitez accomplir : se former, s\'entraîner, s\'évaluer ou créer.',
      disableBeacon: true,
    },
    {
      target: '[data-id="careers-tab"]',
      content: 'Cette vue présente des parcours adaptés à différents métiers de la cybersécurité, comme la gouvernance, la sécurité opérationnelle ou le test d\'intrusion.',
      disableBeacon: true,
    },
    {
      target: '[data-id="all-modules-tab"]',
      content: 'Accédez ici à tous les modules disponibles avec des options de filtrage avancées.',
      disableBeacon: true,
    },
    {
      target: '[data-id="search-input"]',
      content: 'Utilisez cette barre de recherche pour trouver rapidement un module spécifique.',
      disableBeacon: true,
    },
    {
      target: '[data-id="beginner-filter"]',
      content: 'Filtrez les modules par niveau de difficulté pour trouver ceux qui correspondent le mieux à votre expérience.',
      disableBeacon: true,
    },
    {
      target: '[data-id="grid-view-button"]',
      content: 'Basculez entre la vue en grille ou en liste selon votre préférence.',
      disableBeacon: true,
    },
    {
      target: '[data-id="objective-apprendre"]',
      content: 'Explorez les modules par objectif d\'apprentissage, comme "Apprendre" pour les formations et tutoriels.',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: 'Vous pouvez maintenant explorer I AM CYBER selon vos préférences. N\'hésitez pas à utiliser le bouton d\'aide si vous avez besoin d\'assistance !',
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