import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

// Types pour le contexte du tutoriel
type TutorialContextType = {
  showTutorial: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
  tourSteps: Record<string, Step[]>;
  currentTour: string | null;
  setCurrentTour: (tour: string) => void;
  tutorialSeen: Record<string, boolean>;
  markTutorialAsSeen: (tour: string) => void;
};

// Création du contexte avec une valeur par défaut
const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Provider du tutoriel
export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState<Record<string, boolean>>({});

  // Chargement de l'état "a vu le tutoriel" depuis le localStorage lors du montage du composant
  useEffect(() => {
    const savedTutorialState = localStorage.getItem('tutorialSeen');
    if (savedTutorialState) {
      try {
        setTutorialSeen(JSON.parse(savedTutorialState));
      } catch (e) {
        console.error('Erreur lors du chargement de l\'état du tutoriel:', e);
      }
    }
  }, []);

  // Sauvegarde de l'état "a vu le tutoriel" dans le localStorage lorsqu'il change
  useEffect(() => {
    if (Object.keys(tutorialSeen).length > 0) {
      localStorage.setItem('tutorialSeen', JSON.stringify(tutorialSeen));
    }
  }, [tutorialSeen]);

  // Fonction pour démarrer le tutoriel
  const startTutorial = () => {
    setShowTutorial(true);
  };

  // Fonction pour terminer le tutoriel
  const endTutorial = () => {
    setShowTutorial(false);
  };

  // Fonction pour marquer un tutoriel comme vu
  const markTutorialAsSeen = (tour: string) => {
    setTutorialSeen(prev => ({ ...prev, [tour]: true }));
  };

  // Définition des étapes du tutoriel pour différentes pages/sections
  const tourSteps: Record<string, Step[]> = {
    // Tutoriel pour la page principale I AM CYBER
    'cyber-mode-selection': [
      {
        target: 'body',
        content: 'Bienvenue dans I AM CYBER, votre plateforme de formation en cybersécurité.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.grid', // Sélecteur pour la grille des modules
        content: 'Choisissez parmi nos différents modules de formation pour développer vos compétences en cybersécurité.',
        placement: 'bottom',
      },
      {
        target: '[data-id="cyber-arcade"]', // Ajoutez cet attribut aux éléments
        content: 'CYBER ARCADE : Des jeux éducatifs pour apprendre les bases de la cybersécurité de manière ludique.',
        placement: 'auto',
      },
      {
        target: '[data-id="cyber-ops"]',
        content: 'CYBER OPS : Participez à des scénarios réalistes pour apprendre à réagir comme un professionnel.',
        placement: 'auto',
      },
      {
        target: '[data-id="cyber-test"]',
        content: 'CYBER TEST : Évaluez vos connaissances et compétences en cybersécurité.',
        placement: 'auto',
      },
      {
        target: '[data-id="cyber-tools"]',
        content: 'CYBER TOOLS : Des outils d\'automatisation pour générer et transformer des documents de sécurité.',
        placement: 'auto',
      },
      {
        target: '[data-id="cyber-ascension"]',
        content: 'CYBER ASCENSION : Un programme complet pour vous former aux certifications cybersécurité les plus reconnues.',
        placement: 'auto',
      },
    ],
    
    // Tutoriel pour la page CYBER ASCENSION
    'cyber-ascension': [
      {
        target: 'body',
        content: 'Bienvenue dans CYBER ASCENSION, votre parcours complet de formation en cybersécurité.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.level-cards', // Sélecteur à ajouter aux éléments de niveau
        content: 'Progressez à travers des niveaux de difficulté croissante pour maîtriser différents aspects de la cybersécurité.',
        placement: 'bottom',
      },
      {
        target: '[data-level="1"]', // Attribut à ajouter au niveau 1
        content: 'Commencez par le niveau 1 pour apprendre les bases fondamentales de la cybersécurité.',
        placement: 'auto',
      },
    ],
    
    // Tutoriel pour la page CYBER TOOLS
    'cyber-tools': [
      {
        target: 'body',
        content: 'Bienvenue dans CYBER TOOLS, des outils pratiques pour automatiser vos tâches de cybersécurité.',
        placement: 'center',
        disableBeacon: true,
      },
      {
        target: '.tools-grid', // Sélecteur à ajouter à la grille d'outils
        content: 'Explorez nos différents outils pour générer et transformer des documents de sécurité.',
        placement: 'bottom',
      },
      {
        target: '[data-tool="policy-converter"]', // Attribut à ajouter à l'outil
        content: 'Le Convertisseur de Politiques transforme des documents techniques en versions accessibles pour différents publics.',
        placement: 'auto',
      },
      {
        target: '[data-tool="phishing-simulator"]', // Attribut à ajouter à l'outil
        content: 'Le Simulateur de Phishing vous aide à créer et analyser des scénarios d\'attaques par hameçonnage.',
        placement: 'auto',
      },
    ],

    // Ajoutez d'autres tutoriels pour différentes sections ici
  };

  return (
    <TutorialContext.Provider
      value={{
        showTutorial,
        startTutorial,
        endTutorial,
        tourSteps,
        currentTour,
        setCurrentTour,
        tutorialSeen,
        markTutorialAsSeen,
      }}
    >
      {children}
      {showTutorial && currentTour && (
        <Joyride
          steps={tourSteps[currentTour] || []}
          run={showTutorial}
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton
          styles={{
            options: {
              primaryColor: '#3B82F6', // Bleu qui correspond à la palette de l'application
              zIndex: 10000,
            },
            buttonNext: {
              backgroundColor: '#3B82F6',
            },
            buttonBack: {
              color: '#3B82F6',
            },
          }}
          callback={(data: CallBackProps) => {
            const { status } = data;
            if (status === 'finished' || status === 'skipped') {
              endTutorial();
              markTutorialAsSeen(currentTour);
            }
          }}
        />
      )}
    </TutorialContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte du tutoriel
export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial doit être utilisé avec un TutorialProvider');
  }
  return context;
};