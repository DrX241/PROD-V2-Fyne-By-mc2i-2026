import { ObjectState, ExitStatus } from '../types/game-enums';
import { RoomData } from '../types/game';

// Définition des salles du jeu
export const rooms: Record<string, RoomData> = {
  // Niveau 0: Introduction 
  'intro': {
    id: 'intro',
    name: 'Briefing de Mission',
    description: 'Salle holographique de préparation à la mission CYBER ESCAPE',
    backgroundImage: '/assets/cyber/escape/intro-room.jpg',
    objects: [
      {
        id: 'mission_brief',
        name: 'Brief de mission',
        description: 'Document explicatif de votre mission en tant que RSSI',
        state: ObjectState.DEFAULT,
        type: 'document',
        usable: true
      },
      {
        id: 'security_toolkit',
        name: 'Kit de sécurité cyber',
        description: 'Outil de base pour les opérations de cybersécurité',
        state: ObjectState.DEFAULT,
        type: 'device',
        usable: true
      }
    ],
    npcs: [
      {
        id: 'commander',
        name: 'Commandant Vidal',
        role: 'Chef des Opérations Cyber',
        description: 'Responsable de la formation des nouveaux RSSI et des missions critiques'
      }
    ],
    exits: {
      'east': {
        direction: 'east',
        roomId: 'vestibule',
        name: 'Entrée du Vestibule',
        status: ExitStatus.OPEN
      }
    }
  },
  
  // Niveau 1: Vestibule - Sensibilisation au phishing
  'vestibule': {
    id: 'vestibule',
    name: 'Vestibule Phish-Alert',
    description: 'Première ligne de défense: un espace dédié à la détection de phishing',
    backgroundImage: '/assets/cyber/escape/vestibule-room.jpg',
    objects: [
      {
        id: 'terminal_phishing',
        name: 'Terminal d\'analyse de phishing',
        description: 'Console dédiée à l\'identification des emails malveillants',
        state: ObjectState.DEFAULT,
        type: 'terminal',
        usable: true
      },
      {
        id: 'security_poster',
        name: 'Affiche de sensibilisation',
        description: 'Poster illustrant les 5 signes qui permettent de reconnaître un phishing',
        state: ObjectState.DEFAULT,
        type: 'document',
        usable: true
      },
      {
        id: 'alert_badge',
        name: 'Badge d\'alerte',
        description: 'Badge de signalement des tentatives de phishing, nécessaire pour progresser',
        state: ObjectState.DISABLED,
        type: 'item',
        usable: false
      }
    ],
    npcs: [
      {
        id: 'analyst_sara',
        name: 'Sara Chen',
        role: 'Analyste Sécurité Email',
        description: 'Spécialiste en détection de phishing et protection de messagerie'
      }
    ],
    exits: {
      'west': {
        direction: 'west',
        roomId: 'intro',
        name: 'Retour au Briefing',
        status: ExitStatus.OPEN
      },
      'east': {
        direction: 'east',
        roomId: 'mur_revelations',
        name: 'Mur des Révélations',
        status: ExitStatus.LOCKED
      }
    },
    challenge: {
      id: 'phishing_challenge',
      type: 'phishing',
      title: 'Détection de Phishing',
      description: 'Analysez les emails pour identifier ceux qui sont malveillants',
      completed: false,
      requiredScore: 7,
      timeBonus: 50
    }
  },
  
  // Niveau 2: Mur des Révélations - Recherche OSINT
  'mur_revelations': {
    id: 'mur_revelations',
    name: 'Mur des Révélations',
    description: 'Centre d\'intelligence où les informations publiques révèlent des secrets',
    backgroundImage: '/assets/cyber/escape/osint-room.jpg',
    objects: [
      {
        id: 'osint_dashboard',
        name: 'Dashboard OSINT',
        description: 'Tableau de bord pour la recherche en sources ouvertes',
        state: ObjectState.DEFAULT,
        type: 'terminal',
        usable: true
      },
      {
        id: 'social_feed',
        name: 'Flux de réseaux sociaux',
        description: 'Agrégateur de données sociales pour l\'investigation numérique',
        state: ObjectState.DEFAULT,
        type: 'terminal',
        usable: true
      },
      {
        id: 'intel_token',
        name: 'Jeton d\'Intelligence',
        description: 'Preuve de compétence en investigation numérique',
        state: ObjectState.DISABLED,
        type: 'item',
        usable: false
      }
    ],
    npcs: [
      {
        id: 'osint_expert',
        name: 'Dimitri Volkov',
        role: 'Expert OSINT',
        description: 'Spécialiste de la collecte d\'information en sources ouvertes et de la reconnaissance passive'
      }
    ],
    exits: {
      'west': {
        direction: 'west',
        roomId: 'vestibule',
        name: 'Retour au Vestibule',
        status: ExitStatus.OPEN
      },
      'north': {
        direction: 'north',
        roomId: 'couloir_badges',
        name: 'Couloir des Badges',
        status: ExitStatus.LOCKED
      }
    },
    challenge: {
      id: 'osint_challenge',
      type: 'puzzle',
      title: 'Investigation Numérique',
      description: 'Utilisez les sources ouvertes pour découvrir des informations cruciales',
      completed: false,
      requiredScore: 5,
      timeBonus: 40
    }
  }
};

// Données initiales pour le jeu
export const initialGameData = {
  currentStage: 1,
  currentRoomId: 'vestibule',
  inventory: {},
  messages: [
    "Bienvenue dans CYBER ESCAPE: Le Pare-feu est tombé! Votre mission est de traverser 10 niveaux de défis cybersécurité pour rétablir les défenses.",
    "En tant que nouveau RSSI, vous devez faire vos preuves en résolvant des défis de cybersécurité variés.",
    "Commencez par démontrer vos compétences en détection de phishing dans le Vestibule Phish-Alert."
  ],
  timeRemaining: 900, // 15 minutes (en secondes)
};