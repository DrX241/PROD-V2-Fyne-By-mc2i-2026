import { Badge } from '../types';

/**
 * Liste des badges disponibles
 */
export const BADGES: Badge[] = [
  {
    id: 'cyber-initiate',
    name: 'Initié Cyber',
    description: 'Vous avez commencé votre parcours dans la cybersécurité en complétant votre première mission.',
    icon: 'Shield',
    type: 'achievement',
    difficulty: 'Débutant'
  },
  {
    id: 'phishing-detector',
    name: 'Détecteur de Phishing',
    description: 'Vous avez démontré votre capacité à identifier les tentatives de phishing.',
    icon: 'Eye',
    type: 'skill',
    difficulty: 'Débutant'
  },
  {
    id: 'password-master',
    name: 'Maître des Mots de Passe',
    description: 'Vous maîtrisez les bonnes pratiques en matière de gestion des mots de passe.',
    icon: 'Key',
    type: 'skill',
    difficulty: 'Débutant'
  },
  {
    id: 'network-sentinel',
    name: 'Sentinelle Réseau',
    description: 'Vous avez démontré votre connaissance des principes fondamentaux de la sécurité réseau.',
    icon: 'Network',
    type: 'skill',
    difficulty: 'Intermédiaire'
  },
  {
    id: 'incident-responder',
    name: 'Intervenant d\'Incident',
    description: 'Vous avez acquis les compétences nécessaires pour répondre efficacement aux incidents de sécurité.',
    icon: 'AlertTriangle',
    type: 'skill',
    difficulty: 'Intermédiaire'
  }
];

export const getBadgeById = (id: string): Badge | undefined => {
  return BADGES.find(badge => badge.id === id);
};