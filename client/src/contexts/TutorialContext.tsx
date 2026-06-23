import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import Joyride, { STATUS, CallBackProps, Step, ACTIONS } from 'react-joyride';

interface TutorialContextType {
  showTutorial: boolean;
  startTutorial: () => void;
  stopTutorial: () => void;
  setCurrentTour: (tourName: string) => void;
  currentTour: string | null;
  tutorialSeen: Record<string, boolean>;
  isTutorialActive: boolean;
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
  isTutorialActive: false,
});

// Étapes du tutoriel pour chaque page
const tourSteps: Record<string, Step[]> = {
  'cyber-mode-selection': [
    {
      target: 'body',
      content: 'Bienvenue dans ESPACE CYBER ! Découvrez notre plateforme dédiée à la formation en cybersécurité.',
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
      target: '.container',
      content: 'Bienvenue dans ESPACE CYBER. Cette interface a été entièrement repensée pour vous offrir une expérience d\'apprentissage sur mesure en cybersécurité.',
      disableBeacon: true,
      placement: 'center',
      spotlightClicks: true,
    },
    {
      target: '[data-id="help-button"]',
      content: 'Le bouton d\'aide vous permet d\'afficher ce guide à tout moment si vous avez besoin d\'assistance.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-id="contrast-button"]',
      content: 'Le mode haut contraste améliore la lisibilité pour les personnes ayant des difficultés visuelles.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-id="text-smaller-button"]',
      content: 'Ce bouton réduit la taille du texte sur toute la page.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-id="text-larger-button"]',
      content: 'Ce bouton augmente la taille du texte sur toute la page pour un meilleur confort de lecture.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-id="main-title"]',
      content: 'Bienvenue dans ESPACE CYBER, votre plateforme d\'apprentissage personnalisée en cybersécurité, adaptée à votre niveau et vos objectifs professionnels.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'bottom',
    },
    {
      target: '[data-id="main-tabs"]',
      content: 'Les onglets principaux vous permettent d\'organiser votre parcours d\'apprentissage selon différentes perspectives.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'bottom',
    },
    {
      target: '[data-id="objectives-tab"]',
      content: 'L\'onglet "Par objectif d\'apprentissage" organise les modules selon vos intentions : acquérir des connaissances, mettre en pratique des compétences, tester votre niveau ou créer vos propres contenus.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-id="careers-tab"]',
      content: 'L\'onglet "Par métier" vous propose des parcours de formation adaptés aux différents métiers de la cybersécurité comme analyste SOC, RSSI, pentester, etc.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-id="all-modules-tab"]',
      content: 'L\'onglet "Tous les modules" vous donne une vue d\'ensemble de toutes les ressources disponibles avec des options de filtrage avancées.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-id="search-input"]',
      content: 'La barre de recherche vous permet de trouver rapidement un module spécifique sans parcourir toutes les catégories.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'bottom',
    },
    {
      target: '[data-id="beginner-filter"]',
      content: 'Les filtres de difficulté vous permettent d\'affiner les modules selon votre niveau d\'expertise.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'top',
    },
    {
      target: '[data-id="grid-view-button"]',
      content: 'Basculez entre la vue en grille ou en liste selon votre préférence.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'left',
    },
    {
      target: '.container',
      content: 'Vous pouvez maintenant explorer ESPACE CYBER selon vos préférences. Le bouton d\'aide est toujours disponible si vous avez besoin d\'assistance.',
      disableBeacon: true,
      placement: 'center',
      spotlightClicks: true,
    },
  ],
  'cyber-academie': [
    {
      target: 'body',
      content: 'Bienvenue à Cyber Académie ! Découvrez notre centre de formation complet en cybersécurité avec une approche interactive et personnalisée.',
      disableBeacon: true,
      placement: 'center',
      spotlightClicks: true,
    },
    {
      target: '.TabsList',
      content: 'Les différents onglets vous permettent d\'accéder à différentes façons d\'explorer le contenu : par modules individuels, par parcours thématiques, ou via votre tableau de bord personnalisé.',
      disableBeacon: true,
      placement: 'bottom',
      spotlightClicks: true,
    },
    {
      target: '[data-id="ai-assistant-button"]',
      content: 'L\'assistant pédagogique IA est votre guide personnel. Il vous propose des plans d\'apprentissage sur mesure en fonction de vos besoins et objectifs professionnels.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '.bg-blue-900\\/20.backdrop-blur-sm.rounded-lg',
      content: 'La barre de recherche et les filtres vous permettent de trouver rapidement des modules selon votre niveau, la catégorie ou la durée souhaitée.',
      disableBeacon: true,
      placement: 'top',
      spotlightClicks: true,
    },
    {
      target: '[value="modules"]',
      content: 'L\'onglet "Modules" contient tous les cours individuels, classés par catégorie : fondamentaux, technique, gouvernance, micro-learning et parcours rapides.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[value="paths"]',
      content: 'L\'onglet "Parcours thématiques" propose des programmes complets combinant plusieurs modules pour maîtriser un domaine spécifique de la cybersécurité.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[value="dashboard"]',
      content: 'Dans "Mon apprentissage", vous pourrez suivre votre progression, visualiser vos statistiques et reprendre vos modules en cours.',
      disableBeacon: true,
      spotlightClicks: true,
    },
    {
      target: '[data-category="fondamentaux"]',
      content: 'Les fondamentaux de la cybersécurité vous donnent les bases essentielles pour comprendre les concepts clés de la sécurité informatique.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'bottom',
    },
    {
      target: '[data-category="technique"]',
      content: 'La section technique approfondit les aspects pratiques de la cybersécurité : sécurité réseau, cloud, applications, etc.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'bottom',
    },
    {
      target: '[data-category="micro-learning"]',
      content: 'Le micro-learning propose des modules courts et ciblés pour acquérir rapidement des compétences spécifiques.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'bottom',
    },
    {
      target: 'body',
      content: 'Explorez Cyber Académie selon votre propre rythme. De nombreux modules vous attendent pour développer vos compétences en cybersécurité !',
      disableBeacon: true,
      placement: 'center',
      spotlightClicks: true,
    },
  ],
};

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [tutorialSeen, setTutorialSeen] = useState<Record<string, boolean>>({});
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  
  // Charger les tutoriels déjà vus depuis le localStorage
  useEffect(() => {
    const seenTutorials = localStorage.getItem('tutorialSeen');
    if (seenTutorials) {
      setTutorialSeen(JSON.parse(seenTutorials));
    }
  }, []);
  
  // Effet pour bloquer le défilement quand le tutoriel est actif
  useEffect(() => {
    if (showTutorial) {
      // Enregistrer la position de défilement actuelle
      scrollPositionRef.current = window.scrollY;
      // Remonter au début de la page
      window.scrollTo(0, 0);
      // Empêcher le défilement
      document.body.style.overflow = 'hidden';
      setIsTutorialActive(true);
    } else {
      // Réactiver le défilement
      document.body.style.overflow = '';
      setIsTutorialActive(false);
      
      // Restaurer la position de défilement (seulement si on quitte le tutoriel, pas quand on le démarre)
      if (isTutorialActive) {
        setTimeout(() => {
          window.scrollTo(0, scrollPositionRef.current);
        }, 100);
      }
    }
    
    return () => {
      // Nettoyage au démontage du composant
      document.body.style.overflow = '';
    };
  }, [showTutorial, isTutorialActive]);

  // Gestionnaire de callback pour le tutoriel
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, type, step } = data;

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
    
    // Forcer le scroll vers le haut à chaque étape du tutoriel
    if (type === "step:after" && step?.target) {
      window.scrollTo(0, 0);
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
        tutorialSeen,
        isTutorialActive
      }}
    >
      <Joyride
        steps={currentSteps}
        run={showTutorial}
        continuous={true}
        showProgress={false}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        scrollToFirstStep={true}
        scrollOffset={0}
        scrollDuration={0}
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
          nextLabelWithProgress: 'Suivant',
          skip: 'Ignorer'
        }}
      />
      {children}
    </TutorialContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useTutorial = () => useContext(TutorialContext);